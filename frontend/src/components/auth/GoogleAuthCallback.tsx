import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { googleLoginSuccess } from '../../redux/reducers/authReducer';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get('token');

    if (token) {
      try {
        hasProcessed.current = true;

        const decodedUser: any = jwtDecode(token);
        dispatch(
          googleLoginSuccess({
            user: {
              _id: decodedUser.id || decodedUser.sub,
              email: decodedUser.email,
              name: decodedUser.name,
            },
            token: token,
          }),
        );

        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Failed to process Google login:', error);
        navigate('/login?error=invalid_token');
      }
    } else if (searchParams.has('error')) {
      navigate(`/login?error=${searchParams.get('error')}`);
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
