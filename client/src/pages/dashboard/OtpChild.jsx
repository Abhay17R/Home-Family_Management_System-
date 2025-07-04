import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard/OtpChild.css'; // Is CSS file ko hum style karenge
import API from '../../api/axios'

const OtpChild = () => {
    // ✅ State ko 5-element ke array mein badal diya
    const [otp, setOtp] = useState(new Array(5).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { email } = useParams(); 
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Page load hote hi pehle box par focus karne ke liye
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Ek box mein type karne par agle box par focus le jaane ke liye
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false; // Sirf numbers allow karein

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Agle input field par focus karein
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };
    
    // Khali box par backspace dabane par pichle box par jaane ke liye
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ✅ OTP array ko string mein jodein
        const enteredOtp = otp.join('');

        // ✅ Validation ko 5-digit ke liye update kiya
        if (enteredOtp.length !== 5) {
            setError('Please enter the complete 5-digit OTP.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // ✅ Axios call mein withCredentials add karna zaroori hai
            const { data } = await API.post(
                'child/verify-otp', 
                {
                    email: decodeURIComponent(email),
                    otp: enteredOtp, // Joda hua string bhejein
                },
                {
                    withCredentials: true, // Cookie bhejne ke liye
                }
            );

            alert( 'Verification successful! Member profile created.');
            navigate('/dashboard/manage-members');

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP or an error occurred.');
            console.error('OTP Verification failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-child-container">
            <div className="otp-card">
                <div className="otp-header">
                    <h2>Verify Your Member's Email</h2>
                    <p>An OTP has been sent to the email address:</p>
                    <strong className="email-display">{decodeURIComponent(email)}</strong>
                </div>
                
                <form onSubmit={handleSubmit} className="otp-form">
                    {/* ✅ Label ko 5-digit ke liye update kiya */}
                    <label htmlFor="otp-0">Enter the 5-digit code below</label>
                    
                    {/* ✅ 5 alag-alag input dibbe banaye gaye */}
                    <div className="otp-input-fields">
                        {otp.map((data, index) => {
                            return (
                                <input
                                    key={index}
                                    type="text"
                                    id={`otp-${index}`}
                                    className="otp-input"
                                    maxLength="1"
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    onFocus={e => e.target.select()}
                                    ref={el => (inputRefs.current[index] = el)}
                                    required
                                />
                            );
                        })}
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit" className="btn-verify" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Create Profile'}
                    </button>
                    
                    <div className="resend-otp">
                        Didn't receive the code? <button type="button" className="resend-link">Resend OTP</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpChild;