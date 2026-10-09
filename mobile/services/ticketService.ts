import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ======================================================
// TYPES
// ======================================================

export type TicketValidationStatus =
  | 'VALID'
  | 'ALREADY_USED'
  | 'INVALID'
  | 'ERROR';

export type TicketScanMethod =
  | 'QR'
  | 'MANUAL';

export type TicketValidationResult = {
  valid: boolean;
  result: TicketValidationStatus;
  message: string;
  reason?: string;
  ticket: Record<string, any> | null;
  scanLogged: boolean;
};

// ======================================================
// LOG TICKET SCAN
// ======================================================

async function logTicketScan(
  ticketId: string | null,
  scanResult: TicketValidationStatus,
  scanMethod: TicketScanMethod,
  notes?: string,
): Promise<boolean> {
  try {
    const {
      error,
    } = await supabase
      .from('ticket_scans')
      .insert({
        ticket_id: ticketId,
        scan_result: scanResult,
        scan_method: scanMethod,
        terminal_id: 'CONDUCTOR_APP',
        scanned_at:
          new Date().toISOString(),
        notes:
          notes ?? null,
      });

    if (error) {
      console.error(
        'Ticket scan log error:',
        error,
      );

      return false;
    }

    console.log(
      'Ticket scan logged:',
      scanResult,
    );

    return true;
  } catch (error) {
    console.error(
      'Ticket scan log exception:',
      error,
    );

    return false;
  }
}

// ======================================================
// VALIDATE TICKET
// ======================================================

export async function validateTicket(
  ticketToken: string,
  scanMethod: TicketScanMethod = 'QR',
): Promise<TicketValidationResult> {
  const token =
    ticketToken.trim();

  // ====================================================
  // EMPTY TOKEN
  // ====================================================

  if (!token) {
    const scanLogged =
      await logTicketScan(
        null,
        'INVALID',
        scanMethod,
        'Empty or unreadable ticket token.',
      );

    return {
      valid: false,
      result: 'INVALID',
      message: 'Invalid Ticket',
      reason:
        'Ticket ID is empty.',
      ticket: null,
      scanLogged,
    };
  }

  // Parse QR JSON payload if present

  let parsedJsonTicket:
    | Record<string, any>
    | null = null;

  let tokenToQuery = token;

  if (
    token.startsWith('{') &&
    token.endsWith('}')
  ) {
    try {
      parsedJsonTicket =
        JSON.parse(token);

      tokenToQuery =
        parsedJsonTicket?.ticket_token ||
        parsedJsonTicket?.ticket_number ||
        parsedJsonTicket?.token ||
        token;
    } catch (err) {
      console.warn(
        'Could not parse ticket JSON:',
        err,
      );
    }
  }

  // ====================================================
  // CHECK DUPLICATE SCAN CACHE
  // ====================================================

  try {
    const usedRaw =
      await AsyncStorage.getItem(
        'transitlk_used_tokens',
      );

    const usedTokens =
      usedRaw
        ? JSON.parse(usedRaw)
        : [];

    if (
      usedTokens.includes(
        tokenToQuery,
      )
    ) {
      let duplicateTicket:
        | Record<string, any>
        | null = null;

      try {
        const {
          data,
          error,
        } = await supabase
          .from('tickets')
          .select('*')
          .eq(
            'ticket_token',
            tokenToQuery,
          )
          .maybeSingle();

        if (
          !error &&
          data
        ) {
          duplicateTicket =
            data;
        }
      } catch (error) {
        console.warn(
          'Duplicate ticket lookup error:',
          error,
        );
      }

      const fallback =
        duplicateTicket ||
        parsedJsonTicket || {
          ticket_token:
            tokenToQuery,
          ticket_number:
            tokenToQuery,
          status: 'USED',
        };

      const scanLogged =
        await logTicketScan(
          duplicateTicket?.id ?? null,
          'ALREADY_USED',
          scanMethod,
          'Duplicate scan. Ticket was already used.',
        );

      return {
        valid: false,
        result: 'ALREADY_USED',
        message:
          'Ticket Already Used',
        reason:
          'This digital ticket has already been validated and cannot be used again.',
        ticket: fallback,
        scanLogged,
      };
    }
  } catch (err) {
    console.warn(
      'Used tokens cache check error:',
      err,
    );
  }

  try {
    // ==================================================
    // 1. FIND TICKET IN SUPABASE
    // ==================================================

    let ticket:
      | Record<string, any>
      | null = null;

    try {
      const {
        data,
        error,
      } = await supabase
        .from('tickets')
        .select('*')
        .eq(
          'ticket_token',
          tokenToQuery,
        )
        .maybeSingle();

      if (
        !error &&
        data
      ) {
        ticket = data;
      }
    } catch {
      // Supabase table may not exist yet or offline
    }

    // ==================================================
    // 2. FALLBACK: FIND TICKET IN ASYNCSTORAGE
    // ==================================================

    if (!ticket) {
      try {
        const stored =
          await AsyncStorage.getItem(
            'transitlk_tickets',
          );

        if (stored) {
          const list =
            JSON.parse(stored);

          if (
            Array.isArray(
              list,
            )
          ) {
            const found =
              list.find(
                (
                  item: any,
                ) =>
                  item.ticket_token ===
                    tokenToQuery ||
                  item.ticket_number ===
                    tokenToQuery ||
                  item.bookingRef ===
                    tokenToQuery,
              );

            if (found) {
              ticket = found;
            }
          }
        }
      } catch (err) {
        console.warn(
          'AsyncStorage lookup error:',
          err,
        );
      }
    }

    // ==================================================
    // TICKET NOT FOUND
    // ==================================================

    if (!ticket) {
      const scanLogged =
        await logTicketScan(
          null,
          'INVALID',
          scanMethod,
          `Unknown QR token: ${tokenToQuery}`,
        );

      return {
        valid: false,
        result: 'INVALID',
        message:
          'Invalid Ticket',
        reason:
          'No ticket was found for this QR code.',
        ticket: null,
        scanLogged,
      };
    }

    // ==================================================
    // NORMALIZE VALUES
    // ==================================================

    const status =
      String(
        ticket.status ??
          '',
      )
        .trim()
        .toLowerCase();

    const paymentStatus =
      String(
        ticket.payment_status ??
          '',
      )
        .trim()
        .toLowerCase();

    console.log(
      'Ticket found:',
      ticket,
    );

    console.log(
      'Ticket status:',
      status,
    );

    console.log(
      'Payment status:',
      paymentStatus,
    );

    // ==================================================
    // ALREADY USED
    // ==================================================

    if (
      status ===
      'used'
    ) {
      const scanLogged =
        await logTicketScan(
          ticket.id,
          'ALREADY_USED',
          scanMethod,
          'Duplicate scan. Ticket was already used.',
        );

      return {
        valid: false,
        result:
          'ALREADY_USED',
        message:
          'Ticket Already Used',
        reason:
          'This ticket has already been validated and cannot be used again.',
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // CANCELLED
    // ==================================================

    if (
      status ===
        'cancelled' ||
      status ===
        'canceled'
    ) {
      const scanLogged =
        await logTicketScan(
          ticket.id,
          'INVALID',
          scanMethod,
          'Ticket is cancelled.',
        );

      return {
        valid: false,
        result: 'INVALID',
        message:
          'Invalid Ticket',
        reason:
          'This ticket has been cancelled.',
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // REJECTED
    // ==================================================

    if (
      status ===
      'rejected'
    ) {
      const scanLogged =
        await logTicketScan(
          ticket.id,
          'INVALID',
          scanMethod,
          'Ticket is rejected.',
        );

      return {
        valid: false,
        result: 'INVALID',
        message:
          'Ticket Rejected',
        reason:
          'This ticket has been rejected.',
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // INVALID STATUS
    // ==================================================

    if (
      status ===
      'invalid'
    ) {
      const scanLogged =
        await logTicketScan(
          ticket.id,
          'INVALID',
          scanMethod,
          'Ticket status is invalid.',
        );

      return {
        valid: false,
        result: 'INVALID',
        message:
          'Invalid Ticket',
        reason:
          'This ticket is marked as invalid.',
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // EXPIRED STATUS
    // ==================================================

    if (
      status ===
      'expired'
    ) {
      const scanLogged =
        await logTicketScan(
          ticket.id,
          'INVALID',
          scanMethod,
          'Ticket status is expired.',
        );

      return {
        valid: false,
        result: 'INVALID',
        message:
          'Ticket Expired',
        reason:
          'This ticket has expired and cannot be accepted.',
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    const invalidPaymentStatuses =
      [
        'unpaid',
        'pending',
        'failed',
        'cancelled',
        'canceled',
        'refunded',
      ];

    if (
      invalidPaymentStatuses.includes(
        paymentStatus,
      )
    ) {
      const scanLogged =
        await logTicketScan(
          ticket.id,
          'INVALID',
          scanMethod,
          `Invalid payment status: ${ticket.payment_status}`,
        );

      return {
        valid: false,
        result: 'INVALID',
        message:
          'Payment Not Valid',
        reason:
          `Ticket payment status is ${ticket.payment_status}.`,
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // CHECK VALID UNTIL
    // ==================================================

    if (
      ticket.valid_until
    ) {
      const validUntil =
        new Date(
          ticket.valid_until,
        );

      const now =
        new Date();

      if (
        !Number.isNaN(
          validUntil.getTime(),
        ) &&
        validUntil.getTime() <
          now.getTime()
      ) {
        const scanLogged =
          await logTicketScan(
            ticket.id,
            'INVALID',
            scanMethod,
            `Ticket expired at ${ticket.valid_until}`,
          );

        return {
          valid: false,
          result: 'INVALID',
          message:
            'Ticket Expired',
          reason:
            'The validity period of this ticket has expired.',
          ticket,
          scanLogged,
        };
      }
    }

    // ==================================================
    // MARK TICKET AS USED
    // ==================================================

    let updatedTicket:
      | Record<string, any>
      | null = null;

    let updateError:
      any = null;

    if (
      ticket.id &&
      typeof ticket.id ===
        'string' &&
      ticket.id.length >
        20
    ) {
      const res =
        await supabase
          .from('tickets')
          .update({
            status: 'USED',
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            ticket.id,
          )
          .neq(
            'status',
            'used',
          )
          .select('*')
          .maybeSingle();

      updatedTicket =
        res.data;

      updateError =
        res.error;
    }

    // Mark in local AsyncStorage used tokens and list

    try {
      const usedRaw =
        await AsyncStorage.getItem(
          'transitlk_used_tokens',
        );

      const usedTokens =
        usedRaw
          ? JSON.parse(
              usedRaw,
            )
          : [];

      if (
        !usedTokens.includes(
          tokenToQuery,
        )
      ) {
        usedTokens.push(
          tokenToQuery,
        );

        await AsyncStorage.setItem(
          'transitlk_used_tokens',
          JSON.stringify(
            usedTokens,
          ),
        );
      }

      const storedRaw =
        await AsyncStorage.getItem(
          'transitlk_tickets',
        );

      if (storedRaw) {
        const list =
          JSON.parse(
            storedRaw,
          );

        if (
          Array.isArray(
            list,
          )
        ) {
          const idx =
            list.findIndex(
              (
                t: any,
              ) =>
                t.ticket_token ===
                  tokenToQuery ||
                t.ticket_number ===
                  tokenToQuery,
            );

          if (
            idx >=
            0
          ) {
            list[
              idx
            ].status =
              'USED';

            await AsyncStorage.setItem(
              'transitlk_tickets',
              JSON.stringify(
                list,
              ),
            );
          }
        }
      }
    } catch (e) {
      console.warn(
        'AsyncStorage update error:',
        e,
      );
    }

    if (
      !updatedTicket &&
      !updateError
    ) {
      updatedTicket = {
        ...ticket,
        status: 'USED',
        payment_status:
          'PAID',
        updated_at:
          new Date().toISOString(),
      };
    }

    // ==================================================
    // UPDATE ERROR
    // ==================================================

    if (updateError) {
      console.error(
        'Ticket update error:',
        updateError,
      );

      const scanLogged =
        await logTicketScan(
          ticket.id,
          'ERROR',
          scanMethod,
          `Ticket update failed: ${updateError.message}`,
        );

      return {
        valid: false,
        result: 'ERROR',
        message:
          'Validation Failed',
        reason:
          `Ticket was found but could not be marked as used: ${updateError.message}`,
        ticket,
        scanLogged,
      };
    }

    // ==================================================
    // POSSIBLE DUPLICATE / CONCURRENT SCAN
    // ==================================================

    if (
      !updatedTicket
    ) {
      const {
        data:
          latestTicket,
      } =
        await supabase
          .from('tickets')
          .select('*')
          .eq(
            'id',
            ticket.id,
          )
          .maybeSingle();

      const scanLogged =
        await logTicketScan(
          ticket.id,
          'ALREADY_USED',
          scanMethod,
          'Ticket was already validated by another scan.',
        );

      return {
        valid: false,
        result:
          'ALREADY_USED',
        message:
          'Ticket Already Used',
        reason:
          'This ticket has already been validated.',
        ticket:
          latestTicket ??
          ticket,
        scanLogged,
      };
    }

    // ==================================================
    // SAVE SUCCESSFUL SCAN
    // ==================================================

    const scanLogged =
      await logTicketScan(
        ticket.id,
        'VALID',
        scanMethod,
        'Ticket successfully validated.',
      );

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      'Ticket successfully validated:',
      updatedTicket,
    );

    return {
      valid: true,
      result: 'VALID',
      message:
        'Valid Ticket',
      reason:
        'Ticket successfully validated and marked as used.',
      ticket:
        updatedTicket,
      scanLogged,
    };
  } catch (error) {
    console.error(
      'Ticket validation error:',
      error,
    );

    return {
      valid: false,
      result: 'ERROR',
      message:
        'Validation Failed',
      reason:
        error instanceof Error
          ? error.message
          : 'Unknown validation error.',
      ticket: null,
      scanLogged: false,
    };
  }
}

// ======================================================
// PASSENGER TICKET CREATION & HISTORY
// ======================================================

export interface CreateTicketInput {
  passengerId?:
    | string
    | null;

  scheduleId?:
    | string
    | null;

  ticketNumber?: string;
  ticketToken?: string;
  ticketType?: string;
  fare: number;
  boardingPoint?: string;
  seatNumber?: string;
  routeNumber?: string;
  serviceName?: string;
  originName?: string;
  destinationName?: string;
  departureTime?: string;
  arrivalTime?: string;
  travelDate?: string;

  passengerCount?:
    | string
    | number;

  passengerDetails?:
    string;

  paymentMethod?: string;
}

export interface TicketRecord {
  id?: string;

  passenger_id?:
    | string
    | null;

  schedule_id?:
    | string
    | null;

  ticket_number: string;
  ticket_token: string;
  ticket_type: string;
  fare: number;

  boarding_point?: string;
  seat_number?: string;

  status: string;

  payment_status:
    string;

  purchased_at:
    string;

  valid_until?: string;
  created_at?: string;
  updated_at?: string;

  route_number?: string;
  service_name?: string;

  origin?: string;
  origin_name?: string;

  destination?: string;
  destination_name?: string;

  departure_time?: string;
  arrival_time?: string;

  travel_date?: string;

  passenger_count?:
    | string
    | number;

  passenger_type?: string;

  payment_method?: string;

  bus_schedules?: any;
}

/**
 * Creates a digital ticket and inserts it directly into the Supabase `tickets` table,
 * while saving to AsyncStorage as local backup.
 */

export async function createTicket(
  input: CreateTicketInput,
): Promise<{
  success: boolean;
  ticket: TicketRecord;
  error?: string;
}> {
  const randomSuffix =
    Math.floor(
      100000 +
        Math.random() *
          900000,
    );

  const ticketNumber =
    input.ticketNumber ||
    `TLK-${randomSuffix}`;

  const ticketToken =
    input.ticketToken ||
    `TLK-2026-${Math.floor(
      1000 +
        Math.random() *
          9000,
    )}-B`;

  const purchasedAt =
    new Date().toISOString();

  const validUntil =
    new Date(
      Date.now() +
        24 *
          60 *
          60 *
          1000,
    ).toISOString();

  // 1. Resolve passenger_id

  let passengerId =
    input.passengerId ||
    null;

  if (!passengerId) {
    try {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (
        user?.id
      ) {
        passengerId =
          user.id;
      }
    } catch {
      // Continue
    }
  }

  // Default to system passenger ID if unauthenticated

  if (!passengerId) {
    passengerId =
      '44736a01-a842-4506-8521-51137f85b2db';
  }

  // 2. Resolve schedule_id

  let scheduleId =
    input.scheduleId ||
    null;

  if (
    !scheduleId &&
    input.routeNumber
  ) {
    try {
      const {
        data:
          matchedSchedule,
      } =
        await supabase
          .from(
            'bus_schedules',
          )
          .select(
            'id',
          )
          .eq(
            'route_number',
            input.routeNumber,
          )
          .limit(
            1,
          )
          .maybeSingle();

      if (
        matchedSchedule?.id
      ) {
        scheduleId =
          matchedSchedule.id;
      }
    } catch {
      // Continue
    }
  }

  // Fallback to first available bus schedule

  if (!scheduleId) {
    try {
      const {
        data:
          anySchedule,
      } =
        await supabase
          .from(
            'bus_schedules',
          )
          .select(
            'id',
          )
          .limit(
            1,
          )
          .maybeSingle();

      if (
        anySchedule?.id
      ) {
        scheduleId =
          anySchedule.id;
      }
    } catch {
      // Continue
    }
  }

  if (!scheduleId) {
    scheduleId =
      '6e752d17-a338-4ce5-a061-3bd74089acfe';
  }

  // 3. Full ticket record

  const fullTicketRecord:
    TicketRecord = {
    passenger_id:
      passengerId,

    schedule_id:
      scheduleId,

    ticket_number:
      ticketNumber,

    ticket_token:
      ticketToken,

    ticket_type:
      input.ticketType ||
      'STANDARD',

    fare:
      input.fare,

    boarding_point:
      input.boardingPoint ||
      input.originName ||
      'Colombo Fort',

    seat_number:
      input.seatNumber ||
      'A1',

    status:
      'ACTIVE',

    payment_status:
      'PAID',

    purchased_at:
      purchasedAt,

    valid_until:
      validUntil,

    created_at:
      purchasedAt,

    updated_at:
      purchasedAt,

    route_number:
      input.routeNumber ||
      '138',

    service_name:
      input.serviceName ||
      'SLTB Express',

    origin:
      input.originName ||
      'Colombo Fort',

    origin_name:
      input.originName ||
      'Colombo Fort',

    destination:
      input.destinationName ||
      'Maharagama',

    destination_name:
      input.destinationName ||
      'Maharagama',

    departure_time:
      input.departureTime ||
      '08:45 AM',

    arrival_time:
      input.arrivalTime ||
      '09:30 AM',

    travel_date:
      input.travelDate ||
      'Today',

    passenger_count:
      input.passengerCount ||
      '1',

    passenger_type:
      input.passengerDetails ||
      '1 Adult',

    payment_method:
      input.paymentMethod ||
      'Visa / LankaPay',
  };

  // 4. Save into Supabase tickets table

  let supabaseError:
    any = null;

  try {
    const supabasePayload:
      Record<
        string,
        any
      > = {
      ticket_number:
        ticketNumber,

      ticket_token:
        ticketToken,

      ticket_type:
        input.ticketType ||
        'STANDARD',

      fare:
        input.fare,

      boarding_point:
        input.boardingPoint ||
        input.originName ||
        'Colombo Fort',

      seat_number:
        input.seatNumber ||
        'A1',

      status:
        'ACTIVE',

      payment_status:
        'PAID',

      purchased_at:
        purchasedAt,

      valid_until:
        validUntil,

      passenger_id:
        passengerId,

      schedule_id:
        scheduleId,
    };

    const res =
      await supabase
        .from(
          'tickets',
        )
        .insert(
          supabasePayload,
        )
        .select('*')
        .maybeSingle();

    if (
      res.error
    ) {
      supabaseError =
        res.error;

      console.warn(
        'Supabase ticket insert error:',
        res.error,
      );
    } else if (
      res.data
    ) {
      fullTicketRecord.id =
        res.data.id;

      console.log(
        'Successfully recorded ticket in Supabase tickets table:',
        res.data.id,
      );
    }
  } catch (
    err: any
  ) {
    supabaseError =
      err;

    console.warn(
      'Supabase ticket insert exception:',
      err,
    );
  }

  // 5. Notification

  try {
    await supabase
      .from(
        'notifications',
      )
      .insert({
        title:
          `Ticket Booked: ${ticketNumber}`,

        message:
          `Your booking for Route ${input.routeNumber || 'Bus'} (${input.originName || 'Origin'} to ${input.destinationName || 'Destination'}) is confirmed. Fare: LKR ${Number(input.fare).toFixed(2)}.`,

        type:
          'ticket',

        route_number:
          input.routeNumber ||
          'Bus',

        is_read:
          false,

        is_active:
          true,
      });
  } catch {
    // Continue
  }

  // 6. Save local backup

  try {
    const existingRaw =
      await AsyncStorage.getItem(
        'transitlk_tickets',
      );

    const list:
      TicketRecord[] =
      existingRaw
        ? JSON.parse(
            existingRaw,
          )
        : [];

    const existingIdx =
      list.findIndex(
        (
          item,
        ) =>
          item.ticket_token ===
            ticketToken ||
          item.ticket_number ===
            ticketNumber,
      );

    if (
      existingIdx >=
      0
    ) {
      list[
        existingIdx
      ] =
        fullTicketRecord;
    } else {
      list.unshift(
        fullTicketRecord,
      );
    }

    await AsyncStorage.setItem(
      'transitlk_tickets',
      JSON.stringify(
        list.slice(
          0,
          50,
        ),
      ),
    );
  } catch {
    // Continue
  }

  return {
    success:
      !supabaseError,

    ticket:
      fullTicketRecord,

    error:
      supabaseError
        ? supabaseError.message ||
          String(
            supabaseError,
          )
        : undefined,
  };
}

/**
 * Fetches passenger tickets from Supabase tickets table.
 */

export async function getPassengerTickets(
  passengerId?:
    | string
    | null,
): Promise<
  TicketRecord[]
> {
  const localMap =
    new Map<
      string,
      TicketRecord
    >();

  // 1. Read local cache

  try {
    const raw =
      await AsyncStorage.getItem(
        'transitlk_tickets',
      );

    if (raw) {
      const parsed:
        TicketRecord[] =
        JSON.parse(
          raw,
        );

      if (
        Array.isArray(
          parsed,
        )
      ) {
        parsed.forEach(
          (
            t,
          ) => {
            if (
              t.ticket_token
            ) {
              localMap.set(
                t.ticket_token,
                t,
              );
            } else if (
              t.ticket_number
            ) {
              localMap.set(
                t.ticket_number,
                t,
              );
            }
          },
        );
      }
    }
  } catch {
    // Continue
  }

  // 2. Fetch from Supabase

  try {
    let query =
      supabase
        .from(
          'tickets',
        )
        .select(
          '*, bus_schedules(*)',
        )
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        );

    if (
      passengerId
    ) {
      query =
        query.eq(
          'passenger_id',
          passengerId,
        );
    }

    const {
      data,
      error,
    } =
      await query;

    if (
      !error &&
      Array.isArray(
        data,
      )
    ) {
      data.forEach(
        (
          row: any,
        ) => {
          const key =
            row.ticket_token ||
            row.ticket_number ||
            row.id;

          const local =
            localMap.get(
              key,
            );

          const sched =
            row.bus_schedules;

          const merged:
            TicketRecord =
            {
              ...row,

              route_number:
                sched?.route_number ||
                local?.route_number ||
                'Bus',

              origin:
                sched?.origin ||
                local?.origin ||
                row.boarding_point ||
                'Colombo',

              origin_name:
                sched?.origin ||
                local?.origin_name ||
                row.boarding_point ||
                'Colombo',

              destination:
                sched?.destination ||
                local?.destination ||
                'Destination',

              destination_name:
                sched?.destination ||
                local?.destination_name ||
                'Destination',

              departure_time:
                sched?.departure_time ||
                local?.departure_time ||
                'Scheduled',

              arrival_time:
                sched?.arrival_time ||
                local?.arrival_time ||
                '',

              service_name:
                sched?.transport_type ||
                local?.service_name ||
                'TransitLK Bus',

              travel_date:
                local?.travel_date ||
                new Date(
                  row.created_at ||
                    row.purchased_at ||
                    Date.now(),
                ).toLocaleDateString(),

              fare:
                Number(
                  row.fare,
                ) ||
                local?.fare ||
                0,

              status:
                row.status ||
                local?.status ||
                'VALID',

              payment_status:
                row.payment_status ||
                local?.payment_status ||
                'PAID',
            };

          localMap.set(
            key,
            merged,
          );
        },
      );
    }
  } catch {
    // Continue
  }

  return Array.from(
    localMap.values(),
  ).sort(
    (
      a,
      b,
    ) => {
      const tA =
        new Date(
          a.created_at ||
            a.purchased_at ||
            0,
        ).getTime();

      const tB =
        new Date(
          b.created_at ||
            b.purchased_at ||
            0,
        ).getTime();

      return (
        tB -
        tA
      );
    },
  );
}