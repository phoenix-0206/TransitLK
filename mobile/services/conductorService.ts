import * as Crypto from 'expo-crypto';

import { supabase } from './supabase';

// ======================================================
// TYPES
// ======================================================

export interface ConductorSignupData {
  fullName: string;
  nicNumber: string;
  employeeId: string;
  phoneNumber: string;
  depot: string;
  email: string;
  password: string;
  pin: string;
}

export interface ConductorLoginResult {
  id: string;
  full_name: string;
  employee_id: string;
  depot: string | null;
  role: string;
  is_active: boolean;
}

// ======================================================
// HELPERS
// ======================================================

function normalizeValue(value: string): string {
  return value.trim();
}

async function hashPin(
  employeeId: string,
  pin: string,
): Promise<string> {
  const value =
    `${employeeId.trim().toUpperCase()}:${pin}`;

  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    value,
  );
}

// ======================================================
// CONDUCTOR SIGNUP
// ======================================================

export async function signupConductor(
  data: ConductorSignupData,
) {
  // ----------------------------------------
  // Normalize values
  // ----------------------------------------

  const fullName =
    normalizeValue(data.fullName);

  const nicNumber =
    normalizeValue(data.nicNumber);

  const employeeId =
    normalizeValue(data.employeeId)
      .toUpperCase();

  const phoneNumber =
    normalizeValue(data.phoneNumber);

  const depot =
    normalizeValue(data.depot);

  const email =
    normalizeValue(data.email)
      .toLowerCase();

  // ----------------------------------------
  // Validate PIN
  // ----------------------------------------

  if (!/^\d{4}$/.test(data.pin)) {
    throw new Error(
      'Shift PIN must contain exactly 4 digits.',
    );
  }

  // ----------------------------------------
  // Hash PIN
  // ----------------------------------------

  const pinHash = await hashPin(
    employeeId,
    data.pin,
  );

  console.log(
    'Creating conductor Auth account...',
  );

  // ----------------------------------------
  // Create Supabase Auth account
  // ----------------------------------------

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.signUp({
      email,
      password: data.password,

      options: {
        data: {
          account_type: 'conductor',

          full_name: fullName,

          nic_number: nicNumber,

          employee_id: employeeId,

          phone_number: phoneNumber,

          depot,

          pin_hash: pinHash,
        },
      },
    });

  // ----------------------------------------
  // Handle Auth error
  // ----------------------------------------

  if (authError) {
    console.log(
      'Supabase Auth signup failed:',
      authError.message,
    );

    throw new Error(
      authError.message,
    );
  }

  // ----------------------------------------
  // Check Auth user
  // ----------------------------------------

  if (!authData.user) {
    throw new Error(
      'Conductor account could not be created.',
    );
  }

  console.log(
    'Auth user created successfully:',
    authData.user.id,
  );

  // ==================================================
  // IMPORTANT
  // ==================================================
  //
  // DO NOT insert into conductor_profiles here.
  //
  // Your Supabase database trigger is already creating
  // the conductor_profiles row when the Auth user is
  // created.
  //
  // The previous code was doing:
  //
  // supabase
  //   .from('conductor_profiles')
  //   .insert(...)
  //
  // That caused the RLS error because the row had
  // already been created by the database trigger.
  //
  // ==================================================

  console.log(
    'Conductor profile is created by Supabase trigger.',
  );

  // ----------------------------------------
  // Return result
  // ----------------------------------------

  return {
    user: authData.user,
    session: authData.session,
  };
}

// ======================================================
// CONDUCTOR LOGIN
// Employee ID + 4-Digit PIN
// ======================================================

export async function loginConductor(
  employeeId: string,
  pin: string,
): Promise<ConductorLoginResult> {

  const normalizedEmployeeId =
    normalizeValue(employeeId)
      .toUpperCase();

  const normalizedPin =
    normalizeValue(pin);

  // ----------------------------------------
  // Validate Employee ID
  // ----------------------------------------

  if (!normalizedEmployeeId) {
    throw new Error(
      'Please enter your Employee ID.',
    );
  }

  // ----------------------------------------
  // Validate PIN
  // ----------------------------------------

  if (!/^\d{4}$/.test(normalizedPin)) {
    throw new Error(
      'Please enter a valid 4-digit PIN.',
    );
  }

  console.log(
    'Attempting conductor login:',
    normalizedEmployeeId,
  );

  // ----------------------------------------
  // Verify through Supabase RPC
  // ----------------------------------------

  const {
    data,
    error,
  } = await supabase.rpc(
    'verify_conductor_pin',
    {
      p_employee_id:
        normalizedEmployeeId,

      p_pin:
        normalizedPin,
    },
  );

  // ----------------------------------------
  // RPC error
  // ----------------------------------------

  if (error) {
    console.log(
      'Conductor RPC error:',
      error.message,
    );

    throw new Error(
      error.message ||
      'Unable to verify conductor login.',
    );
  }

  console.log(
    'Conductor RPC result:',
    data,
  );

  // ----------------------------------------
  // No matching conductor
  // ----------------------------------------

  if (!data || data.length === 0) {
    throw new Error(
      'Invalid Employee ID or PIN.',
    );
  }

  // ----------------------------------------
  // Return conductor
  // ----------------------------------------

  return data[0] as ConductorLoginResult;
}