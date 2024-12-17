import React from "react"
import { useNavigate } from "react-router-dom";


class ErrorBoundary extends React.Component {
    state = { hasError: false, errorMessage: '' };

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.log(error, info);
        this.setState({
            errorMessage: error.message || "Something went wrong"
        });
    }


    render() {

        if (this.state.hasError) {
          return (
            <div className='page-center' id='white'>
                <h1> An Error Occurred: {this.state.errorMessage} </h1>
                <a href="/welcome" className="btn">Go to Welcome Page</a>
            </div>
          )
        }
        return this.props.children;
      }
}

export default ErrorBoundary;