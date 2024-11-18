import React from 'react';

const Signup = () => {
  return (
    <>
      <div id="form">
        <h1 className="title">Signup</h1>
        <form id="signup-form" action="/users/signup" method="post">
          <label htmlFor="email">Email:</label><br />
          <input type="email" id="signup-email" name="email" required /><br />
          <label htmlFor="password">Password:</label><br />
          <input
            type="password"
            id="signup-password"
            name="password"
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

