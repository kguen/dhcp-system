import React, { useContext } from 'react';
import { UserContext } from '../../contexts';

export const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="home-container">
      <h1>Home page</h1>
      <p className="d-flex flex-column">
        <span>Tên: {user.data?.fullName}</span>
        <span>Email: {user.data?.email}</span>
        <span>Vị trí: {user.data?.position}</span>
      </p>
    </div>
  );
};
