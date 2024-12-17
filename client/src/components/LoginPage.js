import { useState } from "react";

import * as Yup from "yup";
import Cookies from 'js-cookie';
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    
    const [newLogin, setNewLogin] = useState({
        loginEmail: '',
        loginPassword: '',
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

    const validatePassword = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            if (!response.ok) {
                throw new Error('Invalid email or password');
            }
            return true;
        } catch (error) {
            return false;  
        }
    };

    const validationSchema = Yup.object({
        loginEmail:  Yup.string().required('Please Input An Email.')
                    .test('emailExists', 'This Email Does Not Exist.', async function(value) {
                        if (!value) return true; 
                        const isUnique = await checkEmailExists(value); 
                        return isUnique; 
                    }),
        loginPassword:   Yup.string().required('Please Input A Password.')
                        .test('correctPassword', 'The Password Is Not Correct For Email.', async function(value) {
                            const { loginEmail } = this.parent;
                            if (!loginEmail || !value) return true;  
                            const isValidPassword = await validatePassword(loginEmail, value); 
                            return isValidPassword;
                        }),
    });



    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewLogin({...newLogin, [name]:value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            await validationSchema.validate(newLogin, { abortEarly: false });

            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newLogin.loginEmail,
                    password: newLogin.loginPassword,
                }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found');
                } else if (response.status === 401) {
                    throw new Error('Invalid credentials');
                } else {
                    throw new Error('Failed to log in');
                }
            }
            
            const data = await response.json();
            const token = data.token;
            Cookies.set('token', token, {
                sameSite: 'None', 
                secure: true,      
                expires: 7     
            });

            setNewLogin({ loginEmail: '', loginPassword: '' });
            navigate('/home');
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
            <h1> Log In </h1>
            <form onSubmit={handleSubmit} className='credential-form'>
                <div className='input-field'>
                    <label> *Email: </label>
                    <input type='text' placeholder='Email' name='loginEmail' onChange={handleChange} value={newLogin.loginEmail} />
                    <div className="input-error">{errors.loginEmail}</div>
                </div>
                <div className='input-field'>
                    <label> *Password: </label>
                    <input type='password' placeholder='Password' name='loginPassword' onChange={handleChange} value={newLogin.loginPassword} />
                    <div className="input-error">{errors.loginPassword}</div>
                </div>
                <button type='submit' className='submit-form-button'> Login </button>
            </form>
            </div>
        </div>
    );
}
