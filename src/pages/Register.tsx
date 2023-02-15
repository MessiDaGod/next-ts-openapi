import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./registerPage.module.css";

interface RegisterProps {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
}

const Register: React.FC<RegisterProps> = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,PATCH,OPTIONS",
  };

  const handleRegister = () => {
    const encoded = `https://localhost:5006/api/auth/DoRegister?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&plainUsername=${encodeURIComponent(username)}&plainPassword=${encodeURIComponent(password)}`;

    fetch(encoded)
      .then((response) => {
        return response.json( );
      })
      .then((data) => {
        console.log(data.message);
      })
      .catch((_error) => {
        // console.info(error);
      });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const encoded = `https://localhost:5006/api/auth/DoRegister?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&plainUsername=${encodeURIComponent(username)}&plainPassword=${encodeURIComponent(password)}`;
    console.log(`${encoded}`);
    const response = await fetch(`${encoded}`, {
      method: 'POST'
    });
    const data = await response.text();
    console.log(data);
  }

  return (
    <div className={styles['register-container']}>
      <h2 className={styles['h2']}>Register</h2>
      <form className={styles['register-form']} onSubmit={onSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="username">Username:</label>
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      <input
          id="submit"
          type="submit"
          value="Submit"
          onClick={() => handleRegister()}
        />
      </form>
    </div>
  );
};

export default Register;