import { useState } from "react";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [newUser, setNewUser] = useState({
        userFirst: '',
        userLast: '',
        userEmail: '',
        userDisplay: '',
        userPassword: '',
        verifyPassword: '',
    });

    const [errors, setErrors] = useState({});

    const checkEmailExists = async (email) => {
        try {
            const response = await fetch(`http://localhost:8000/emailExists?email=${email}`);
            const data = await response.json();
    
            if (data.isUnique) {
                return false; 
            } else {
                return true;  
            }
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const checkDisplayExists = async (displayName) => {
        try {
            const response = await fetch(`http://localhost:8000/displayNameExists?displayName=${displayName}`);
            const data = await response.json();
    
            if (data.isUnique) {
                return false; 
            } else {
                return true;  
            }
        } catch (error) {
            console.error('Error checking display name:', error);
            return false;
        }
    };

    const validationSchema = Yup.object({
        userFirst:  Yup.string().max(50, 'First Name Cannot Be Longer Than 50 Characters.').required('First Name Is Required.')
                    .test('noInvalidChars', 'First Name Should Not Contain Numbers, Spaces, or Punctuation.', value => !/[0-9\s.,\/#!$%\^&\*;:{}=\-_`~()]/.test(value)),
        userLast:   Yup.string().max(50, 'Last Name Cannot Be Longer Than 50 Characters.').required('Last Name Is Required.')
                    .test('noInvalidChars', 'Last Name Should Not Contain Numbers, Spaces, or Punctuation.', value => !/[0-9\s.,\/#!$%\^&\*;:{}=\-_`~()]/.test(value)),
        userEmail:  Yup.string().max(300, 'Email Cannot Be Longer Than 300 Characters.').required("Email Is Required.").email("Invalid Email Format. Must Include Email Prefix And Domain.")
                    .test('emailExists', 'This Email Already Exists.', async function(value) {
                        if (!value) return true; 
                        const isUnique = await checkEmailExists(value); 
                        return !isUnique; 
                    }),
        userDisplay: Yup.string().min(3, 'Display Name Must Be At Least 3 Characters.').max(50, 'Display Name Cannot Be Longer Than 50 Characters.').required('Display Name Is Required.')
                    .test('noSpaces', 'Display Name Should Not Contain Spaces..', value => !/\s/.test(value))
                    .test('nameExists', 'This Display Name Already Exists.', async function(value) {
                        if (!value) return true; 
                        const isUnique = await checkDisplayExists(value); 
                        return !isUnique; 
                    }),
        userPassword:   Yup.string().min(5, 'Password Must Be At Least 3 Characters.').max(50, 'Password Cannot Be Longer Than 50 Characters.').required('Password is Required.')
                        .test('noSpaces', 'Password should not contain spaces.', value => !/\s/.test(value))
                        .test('passwordFormat', 'Password Cannot Contain Your First Name, Last Name, or Email Prefix.', function(value) {
                            const { userFirst, userLast, userEmail, userDisplay } = this.parent; 
                            if (!value) return true; 
                            
                            const lowerCaseValue = value.toLowerCase(); 
                            const lowerCaseFirst = userFirst.toLowerCase();
                            const lowerCaseLast = userLast.toLowerCase();
                            const lowerCaseEmail = userEmail.toLowerCase();
                            const lowerCaseDisplay = userDisplay.toLowerCase();
                    
                            return !(
                                (lowerCaseFirst && lowerCaseValue.includes(lowerCaseFirst)) || 
                                (lowerCaseLast && lowerCaseValue.includes(lowerCaseLast)) || 
                                (lowerCaseDisplay && lowerCaseValue.includes(lowerCaseDisplay)) || 
                                (lowerCaseEmail && lowerCaseValue.includes(lowerCaseEmail.split('@')[0]))
                            );
                        }),
        verifyPassword: Yup.string().required('Please Confirm Your Password.').test('passwordsMatch', 'Passwords Must Match.', function (value) { return value === this.parent.userPassword; }),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        try {
            await validationSchema.validate(newUser, { abortEarly: false });

            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: newUser.userFirst,
                    lastName: newUser.userLast,
                    email: newUser.userEmail,
                    displayName: newUser.userDisplay,
                    password: newUser.userPassword,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create User.');
            }

            console.log('User Created Successfully!');
            navigate('/welcome');

        } catch (error) {
            if (error.inner) {
                const newErrors = {};

                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });

                setErrors(newErrors);
            } else {
                console.error('Error creating user:', error);
            }
        }
    };

    return (
        <div className='page-center'>
            <div className='credential-back-button'>
                <button onClick={() => navigate('/welcome')}> 
                    <ion-icon name="arrow-back-outline"></ion-icon>
                </button>
            </div>
            <div className='credential-form-container'>
                <h1> Register </h1>
                <form onSubmit={handleSubmit} className='credential-form'>
                    <div className='input-field'>
                        <label> *First Name:</label>
                        <input type='text' name='userFirst' value={newUser.userFirst} placeholder='First Name' onChange={handleChange} />
                        <div className="input-error"> {errors.userFirst} </div>
                    </div>

                    <div className='input-field'>
                        <label> *Last Name:</label>
                        <input type='text' name='userLast' value={newUser.userLast} placeholder='Last Name' onChange={handleChange} />
                        <div className="input-error">{errors.userLast}</div>
                    </div>

                    <div className='input-field'>
                        <label> *Email: </label>
                        <input type='text' name='userEmail' value={newUser.userEmail} placeholder='Email' onChange={handleChange} />
                        <div className="input-error">{errors.userEmail}</div>
                    </div>

                    <div className='input-field'>
                        <label> *Display Name: </label>
                        <input type='text' name='userDisplay' value={newUser.userDisplay} placeholder='Display Name' onChange={handleChange}
                        />
                        <div className="input-error">{errors.userDisplay}</div>
                    </div>

                    <div className='input-field'>
                        <label> *Password: </label>
                        <input type='password' name='userPassword' value={newUser.userPassword} placeholder='Password' onChange={handleChange} />
                        <div className="input-error">{errors.userPassword}</div>
                    </div>

                    <div className='input-field'>
                        <label> *Verify Password: </label>
                        <input type='password' name='verifyPassword' value={newUser.verifyPassword} placeholder='Verify Password' onChange={handleChange} />
                        <div className="input-error">{errors.verifyPassword}</div>
                    </div>

                    <button type="submit" className='submit-form-button'>Sign Up </button>
                </form>
            </div>

        </div>
    );
}