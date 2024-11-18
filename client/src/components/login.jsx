const Login = () => (
  <div id="form" className="form">
    <h1 className="title">Login</h1>
    <form action="/users/login" method="post">
      <label htmlFor="email">Email</label>
      <input type="email" name="email" id="email" required /><br />
      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" required /><br />
      <input type="submit" value="Submit" />
      <a href="/users/signup">Sign Up For Account</a>
    </form>
  </div>
);

export default Login;
