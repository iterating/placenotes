import React from 'react';
const Signup = React.lazy(() => import("./users/Signup"));

const Main = () => (
  <React.Suspense fallback={<div>Loading...</div>}>
    <main>
      <Signup />
    </main>
  </React.Suspense>
);

export default Main;

