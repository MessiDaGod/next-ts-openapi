import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface RegisterProps {
  username?: string;
  password?: string;
}

const Register: React.FC<RegisterProps> = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,PATCH,OPTIONS",
  };

  const handleRegister = (Username: string, Password: string) => {
    const url = `/api/register?username=${Username}&password=${Password}`;
    // const encodedUrl = encodeURIComponent(url);

    fetch(url)
      .then((response) => {
        return response.json( );
      })
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => {
        // console.info(error);
      });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ username: username, password: password }),
      });

      const data = await response.json();

      // if (response.status !== 200) {
      //   throw data.error || new Error(`Request failed with status ${response.status}`);
      // }

      if (response.status !== 200) {
        alert(data.error.message);
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

    } catch (error) {
      // alert(error.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
      <label htmlFor="username">Username:</label>
        <input
          type="username"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </form>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <input
          id="submit"
          type="submit"
          value="Submit"
          onClick={() => handleRegister(username, password)}
        />
    </div>
  );
};

export default Register;