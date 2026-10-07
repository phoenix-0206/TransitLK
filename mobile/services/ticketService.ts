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
  ticketId: string,
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
    return {
      valid: false,

      result: 'INVALID',

      message: 'Invalid Ticket',

      reason:
        'Ticket ID is empty.',

      ticket: null,

      scanLogged: false,
    };
  }

  try {
    // ==================================================
    // FIND TICKET
    // ==================================================

    const {
      data: ticket,
      error: ticketError,
    } = await supabase
      .from('tickets')
      .select('*')
      .eq(
        'ticket_token',
        token,
      )
      .maybeSingle();

    // ==================================================
    // DATABASE ERROR
    // ==================================================

    if (ticketError) {
      console.error(
        'Ticket lookup error:',
        ticketError,
      );

      return {
        valid: false,

        result: 'ERROR',

        message:
          'Validation Failed',

        reason:
          ticketError.message,

        ticket: null,

        scanLogged: false,
      };
    }

    // ==================================================
    // TICKET NOT FOUND
    // ==================================================

    if (!ticket) {
      return {
        valid: false,

        result: 'INVALID',

        message:
          'Invalid Ticket',

        reason:
          'No ticket was found for this QR code.',

        ticket: null,

        // No ticket_id exists,
        // so we cannot safely create
        // a ticket_scans record.
        scanLogged: false,
      };
    }

    // ==================================================
    // NORMALIZE VALUES
    // ==================================================

    const status = String(
      ticket.status ?? '',
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
      status === 'used'
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
      status === 'canceled'
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
      status === 'rejected'
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
      status === 'invalid'
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
      status === 'expired'
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

    const {
      data:
        updatedTicket,

      error:
        updateError,
    } = await supabase
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

    if (!updatedTicket) {
      const {
        data:
          latestTicket,
      } = await supabase
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