import axios from 'axios';

const Signup = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/users/signup', {
        email,
        password
      });
      const data = response.data;
      if (data.success) {
        localStorage.setItem('token', data.token);
        props.history.push('/notes');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <>
      <div id="form">
        <h1 className="title">Signup</h1>
        <form id="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label><br />
          <input type="email" id="signup-email" value={email} onChange={(event) => setEmail(event.target.value)} required /><br />
          <label htmlFor="password">Password:</label><br />
          <input
            type="password"
            id="signup-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          /><br />
          <input type="submit" value="Create Account" />
          <a href="/users/login">Already have an account? Login</a>
        </form>
      </div>
    </>
  );
};

export default Signup;

