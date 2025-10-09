/** @format */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { googleLoginSuccess } from '../../redux/reducers/authReducer'; // Adjust path if needed

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        // 1. Store the token in localStorage
        localStorage.setItem('accessToken', token);

        // 2. Decode the token to get user payload
        // This payload should match what you signed in the backend JWT
        const decodedUser: { id: string; email: string } = jwtDecode(token);

        // 3. Dispatch the success action to update Redux state
        // The user object here can be partial, as long as it's enough for the UI
        // A subsequent call to getProfile can fetch the full user object if needed.
        dispatch(
          googleLoginSuccess({
            user: { _id: decodedUser.id, email: decodedUser.email },
            token,
          }),
        );

        // 4. Redirect to the dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Invalid token:', error);
        // Redirect to login page with an error
        navigate('/login?error=invalid_token');
      }
    } else {
      // No token found, redirect to login
      navigate('/login?error=no_token');
    }
  }, [dispatch, navigate, searchParams]);

  // Render a loading indicator while processing
  return <div>Loading, please wait...</div>;
};

export default GoogleAuthCallback;
