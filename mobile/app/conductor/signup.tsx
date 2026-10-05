import React, { useState } from 'react';



import {

  ActivityIndicator,

  Alert,

  KeyboardAvoidingView,

  Platform,

  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  View,

} from 'react-native';



import { useRouter } from 'expo-router';



import { signupConductor } from '../../services/conductorService';



export default function ConductorSignupScreen() {

  const router = useRouter();



  // ======================================================

  // FORM STATE

  // ======================================================



  const [fullName, setFullName] = useState('');

  const [nicNumber, setNicNumber] = useState('');

  const [employeeId, setEmployeeId] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  const [depot, setDepot] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [pin, setPin] = useState('');

  const [confirmPin, setConfirmPin] = useState('');



  // ======================================================

  // UI STATE

  // ======================================================



  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =

    useState(false);

  const [showPin, setShowPin] = useState(false);

  const [loading, setLoading] = useState(false);



  // ======================================================

  // ERROR

  // ======================================================



  function showError(message: string) {

    Alert.alert('Signup Error', message);

  }



  // ======================================================

  // VALIDATION

  // ======================================================



  function validateForm(): boolean {

    console.log('Starting form validation...');



    const cleanFullName = fullName.trim();

    const cleanNic = nicNumber.trim();

    const cleanEmployeeId = employeeId.trim();

    const cleanPhone = phoneNumber.trim();

    const cleanDepot = depot.trim();

    const cleanEmail = email.trim().toLowerCase();



    // Full Name

    if (!cleanFullName) {

      showError('Please enter your full name.');

      return false;

    }



    // NIC / Passport

    if (!cleanNic) {

      showError(

        'Please enter your NIC or Passport number.',

      );

      return false;

    }



    // Employee ID

    if (!cleanEmployeeId) {

      showError(

        'Please enter your employee or badge ID.',

      );

      return false;

    }



    // Phone

    if (!cleanPhone) {

      showError('Please enter your mobile number.');

      return false;

    }



    // Depot

    if (!cleanDepot) {

      showError('Please enter your assigned depot.');

      return false;

    }



    // Email

    if (!cleanEmail) {

      showError('Please enter your email.');

      return false;

    }



    if (

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

        cleanEmail,

      )

    ) {

      showError(

        'Please enter a valid email address.',

      );

      return false;

    }



    // Password

    if (!password) {

      showError('Please enter a password.');

      return false;

    }



    if (password.length < 6) {

      showError(

        'Password must contain at least 6 characters.',

      );

      return false;

    }



    // Confirm Password

    if (!confirmPassword) {

      showError(

        'Please confirm your password.',

      );

      return false;

    }



    if (password !== confirmPassword) {

      showError('Passwords do not match.');

      return false;

    }



    // PIN

    if (!/^\d{4}$/.test(pin)) {

      showError(

        'Shift PIN must contain exactly 4 digits.',

      );

      return false;

    }



    // Confirm PIN

    if (!/^\d{4}$/.test(confirmPin)) {

      showError(

        'Confirm Shift PIN must contain exactly 4 digits.',

      );

      return false;

    }



    if (pin !== confirmPin) {

      showError('Shift PINs do not match.');

      return false;

    }



    console.log('VALIDATION PASSED');



    return true;

  }



  // ======================================================

  // SIGNUP

  // ======================================================



  async function handleSignup() {

    console.log('================================');

    console.log('HANDLE SIGNUP STARTED');

    console.log('================================');



    // ----------------------------------------

    // Debug information

    // ----------------------------------------



    console.log('Form values:', {

      fullName,

      nicNumber,

      employeeId,

      phoneNumber,

      depot,

      email,



      // Never print actual password/PIN

      passwordLength: password.length,

      confirmPasswordLength:

        confirmPassword.length,

      pinLength: pin.length,

      confirmPinLength: confirmPin.length,

    });



    // ----------------------------------------

    // Validate

    // ----------------------------------------



    console.log('Running form validation...');



    if (!validateForm()) {

      console.log('VALIDATION FAILED');

      return;

    }



    console.log('VALIDATION PASSED');



    try {

      setLoading(true);



      console.log('Calling signupConductor...');



      // ----------------------------------------

      // Create conductor

      // ----------------------------------------



      const result = await signupConductor({

        fullName: fullName.trim(),



        nicNumber: nicNumber.trim(),



        employeeId: employeeId

          .trim()

          .toUpperCase(),



        phoneNumber: phoneNumber.trim(),



        depot: depot.trim(),



        email: email

          .trim()

          .toLowerCase(),



        password,



        pin,

      });



      // ----------------------------------------

      // Signup successful

      // ----------------------------------------



      console.log('signupConductor SUCCESS');



      if (result.user) {

        console.log(

          'Created Auth user:',

          result.user.id,

        );

      }



      // ----------------------------------------

      // AUTOMATICALLY GO TO LOGIN PAGE

      // ----------------------------------------

      router.replace('/conductor/login');

      return;



      // ----------------------------------------

      // Email confirmation

      // ----------------------------------------



      if (!result.session) {

        console.log('No session returned.');

        console.log(

          'Email confirmation may be required.',

        );



        Alert.alert(

          'Registration Successful',

          'Your conductor account has been created. Please check your email to confirm your account before logging in.',

          [

            {

              text: 'OK',

              onPress: () => {

                router.replace(

                  '/conductor/login',

                );

              },

            },

          ],

        );



        return;

      }



      // ----------------------------------------

      // Registration successful

      // ----------------------------------------



      console.log('Session returned.');



      console.log(

        'Registration completed successfully.',

      );



      Alert.alert(

        'Registration Successful',

        'Your conductor account has been created successfully.',

        [

          {

            text: 'Continue',

            onPress: () => {

              router.replace(

                '/conductor/login',

              );

            },

          },

        ],

      );

    } catch (error) {

      // IMPORTANT:

      // Use console.log instead of console.error

      // so Expo Web does not show a red Console Error

      // overlay for this debug output.



      console.log(

        '================================',

      );



      console.log(

        'CONDUCTOR SIGNUP ERROR',

      );



      console.log(error);



      console.log(

        '================================',

      );



      const message =

        error instanceof Error

          ? error.message

          : 'Something went wrong during signup.';



      showError(message);

    } finally {

      console.log(

        'Signup process finished.',

      );



      setLoading(false);

    }

  }



  // ======================================================

  // UI

  // ======================================================



  return (

    <KeyboardAvoidingView

      style={styles.flex}

      behavior={

        Platform.OS === 'ios'

          ? 'padding'

          : undefined

      }

    >

      <ScrollView

        contentContainerStyle={styles.container}

        keyboardShouldPersistTaps="handled"

        showsVerticalScrollIndicator={false}

      >

        {/* Header */}



        <View style={styles.header}>

          <Text style={styles.logo}>

            TransitLK

          </Text>



          <Text style={styles.title}>

            Conductor Registration

          </Text>



          <Text style={styles.subtitle}>

            Create your conductor account

          </Text>

        </View>



        {/* Card */}



        <View style={styles.card}>

          {/* Personal Information */}



          <Text style={styles.sectionTitle}>

            Personal Information

          </Text>



          <InputField

            label="Full Name"

            placeholder="Enter your full name"

            value={fullName}

            onChangeText={setFullName}

            autoCapitalize="words"

          />



          <InputField

            label="NIC / Passport"

            placeholder="Enter NIC or Passport number"

            value={nicNumber}

            onChangeText={setNicNumber}

            autoCapitalize="characters"

          />



          <InputField

            label="Employee / Badge ID"

            placeholder="Enter employee ID"

            value={employeeId}

            onChangeText={(value) =>

              setEmployeeId(

                value

                  .toUpperCase()

                  .trimStart(),

              )

            }

            autoCapitalize="characters"

            autoCorrect={false}

          />



          <InputField

            label="Mobile Number"

            placeholder="Enter mobile number"

            value={phoneNumber}

            onChangeText={setPhoneNumber}

            keyboardType="phone-pad"

          />



          <InputField

            label="Assigned Depot"

            placeholder="Enter assigned depot"

            value={depot}

            onChangeText={setDepot}

          />



          {/* Account Information */}



          <Text style={styles.sectionTitle}>

            Account Information

          </Text>



          <InputField

            label="Email"

            placeholder="Enter email address"

            value={email}

            onChangeText={setEmail}

            keyboardType="email-address"

            autoCapitalize="none"

            autoCorrect={false}

          />



          <InputField

            label="Password"

            placeholder="Create a password"

            value={password}

            onChangeText={setPassword}

            secureTextEntry={!showPassword}

            autoCapitalize="none"

            autoCorrect={false}

            rightText={

              showPassword ? 'Hide' : 'Show'

            }

            onRightPress={() =>

              setShowPassword(

                !showPassword,

              )

            }

          />



          <InputField

            label="Confirm Password"

            placeholder="Re-enter password"

            value={confirmPassword}

            onChangeText={setConfirmPassword}

            secureTextEntry={

              !showConfirmPassword

            }

            autoCapitalize="none"

            autoCorrect={false}

            rightText={

              showConfirmPassword

                ? 'Hide'

                : 'Show'

            }

            onRightPress={() =>

              setShowConfirmPassword(

                !showConfirmPassword,

              )

            }

          />



          {/* Shift PIN */}



          <Text style={styles.sectionTitle}>

            Shift Security PIN

          </Text>



          <Text style={styles.helperText}>

            Create a 4-digit PIN for conductor

            shift access.

          </Text>



          <InputField

            label="4-Digit Shift PIN"

            placeholder="••••"

            value={pin}

            onChangeText={(value) => {

              const digits = value

                .replace(/\D/g, '')

                .slice(0, 4);



              setPin(digits);

            }}

            keyboardType="number-pad"

            secureTextEntry={!showPin}

            maxLength={4}

            rightText={

              showPin ? 'Hide' : 'Show'

            }

            onRightPress={() =>

              setShowPin(!showPin)

            }

          />



          <InputField

            label="Confirm Shift PIN"

            placeholder="••••"

            value={confirmPin}

            onChangeText={(value) => {

              const digits = value

                .replace(/\D/g, '')

                .slice(0, 4);



              setConfirmPin(digits);

            }}

            keyboardType="number-pad"

            secureTextEntry={!showPin}

            maxLength={4}

          />



          {/* Signup Button */}



          <Pressable

            style={[

              styles.signupButton,

              loading &&

                styles.disabledButton,

            ]}

            onPress={handleSignup}

            disabled={loading}

          >

            {loading ? (

              <ActivityIndicator

                color="#FFFFFF"

              />

            ) : (

              <Text style={styles.buttonText}>

                CREATE CONDUCTOR ACCOUNT

              </Text>

            )}

          </Pressable>



          {/* Login */}



          <View style={styles.loginRow}>

            <Text style={styles.loginText}>

              Already have an account?

            </Text>



            <Pressable

              disabled={loading}

              onPress={() =>

                router.push(

                  '/conductor/login',

                )

              }

            >

              <Text style={styles.loginLink}>

                Login

              </Text>

            </Pressable>

          </View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>

  );

}



// ======================================================

// INPUT COMPONENT

// ======================================================



interface InputFieldProps {

  label: string;

  placeholder: string;

  value: string;

  onChangeText: (value: string) => void;



  secureTextEntry?: boolean;



  keyboardType?:

    | 'default'

    | 'email-address'

    | 'phone-pad'

    | 'number-pad';



  autoCapitalize?:

    | 'none'

    | 'sentences'

    | 'words'

    | 'characters';



  autoCorrect?: boolean;



  maxLength?: number;



  rightText?: string;



  onRightPress?: () => void;

}



function InputField({

  label,

  placeholder,

  value,

  onChangeText,

  secureTextEntry = false,

  keyboardType = 'default',

  autoCapitalize = 'sentences',

  autoCorrect = true,

  maxLength,

  rightText,

  onRightPress,

}: InputFieldProps) {

  return (

    <View style={styles.inputContainer}>

      <Text style={styles.label}>

        {label}

      </Text>



      <View style={styles.inputWrapper}>

        <TextInput

          style={[

            styles.input,

            rightText &&

              styles.inputWithButton,

          ]}

          placeholder={placeholder}

          placeholderTextColor="#8A9AA6"

          value={value}

          onChangeText={onChangeText}

          secureTextEntry={

            secureTextEntry

          }

          keyboardType={keyboardType}

          autoCapitalize={

            autoCapitalize

          }

          autoCorrect={autoCorrect}

          maxLength={maxLength}

          editable={true}

        />



        {rightText &&

          onRightPress && (

            <Pressable

              style={styles.showButton}

              onPress={onRightPress}

            >

              <Text

                style={styles.showText}

              >

                {rightText}

              </Text>

            </Pressable>

          )}

      </View>

    </View>

  );

}



// ======================================================

// STYLES

// ======================================================



const styles = StyleSheet.create({

  flex: {

    flex: 1,

    backgroundColor: '#F4F8FA',

  },



  container: {

    flexGrow: 1,

    paddingHorizontal: 20,

    paddingVertical: 32,

    alignItems: 'center',

  },



  header: {

    width: '100%',

    maxWidth: 600,

    marginBottom: 24,

  },



  logo: {

    fontSize: 28,

    fontWeight: '800',

    color: '#087F80',

    marginBottom: 12,

  },



  title: {

    fontSize: 28,

    fontWeight: '800',

    color: '#103851',

  },



  subtitle: {

    marginTop: 6,

    fontSize: 15,

    color: '#58717F',

  },



  card: {

    width: '100%',

    maxWidth: 600,

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    padding: 22,



    shadowColor: '#000000',



    shadowOffset: {

      width: 0,

      height: 4,

    },



    shadowOpacity: 0.08,

    shadowRadius: 12,



    elevation: 3,

  },



  sectionTitle: {

    fontSize: 18,

    fontWeight: '700',

    color: '#103851',

    marginTop: 8,

    marginBottom: 16,

  },



  helperText: {

    color: '#58717F',

    fontSize: 13,

    lineHeight: 19,

    marginTop: -8,

    marginBottom: 16,

  },



  inputContainer: {

    marginBottom: 16,

  },



  label: {

    fontSize: 14,

    fontWeight: '600',

    color: '#103851',

    marginBottom: 7,

  },



  inputWrapper: {

    position: 'relative',

  },



  input: {

    height: 52,

    borderWidth: 1,

    borderColor: '#DEE8ED',

    borderRadius: 12,

    backgroundColor: '#F8FAFB',

    paddingHorizontal: 15,

    fontSize: 15,

    color: '#103851',

  },



  inputWithButton: {

    paddingRight: 65,

  },



  showButton: {

    position: 'absolute',

    right: 14,

    top: 0,

    height: 52,

    justifyContent: 'center',

  },



  showText: {

    color: '#087F80',

    fontSize: 13,

    fontWeight: '700',

  },



  signupButton: {

    height: 54,

    borderRadius: 12,

    backgroundColor: '#087F80',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 10,

  },



  disabledButton: {

    opacity: 0.6,

  },



  buttonText: {

    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '800',

    letterSpacing: 0.3,

  },



  loginRow: {

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 20,

  },



  loginText: {

    color: '#58717F',

    fontSize: 14,

  },



  loginLink: {

    marginLeft: 5,

    color: '#087F80',

    fontSize: 14,

    fontWeight: '700',

  },

});