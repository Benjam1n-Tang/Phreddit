import { useNavigate } from 'react-router-dom';

export default function NetworkError() {
    const navigate = useNavigate();

    const handleRefreshAndNavigate = () => {
        navigate('/welcome'); 
        window.location.reload(); 
    };

    return (
        <div className='page-center' id='white'>
            <h1> Network Error Please Fix Your Connection. </h1>
            <button onClick={handleRefreshAndNavigate}> Welcome Page </button>
        </div>
      )
}