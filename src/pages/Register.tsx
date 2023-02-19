import React, { useState } from "react";
import styles from "./register.module.scss";
import { useRouter } from "next/router";

interface RegisterProps {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
}

const Register: React.FC<RegisterProps> = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    console.info("handleRegister");
    if (!name || !email || !username || !password) return;
    const encoded = `https://localhost:5006/api/auth/DoRegister?name=${encodeURIComponent(
      name
    )}&email=${encodeURIComponent(email)}&plainUsername=${encodeURIComponent(
      username
    )}&plainPassword=${encodeURIComponent(password)}`;

    fetch(encoded)
      .then((response) => {
        return response.json();
      })
      .then((data) => {})
      .catch((_error) => {
        // console.info(error)
      });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    console.info("onSubmit");
    if (!name || !email || !username || !password) {
      alert("Please fill in all fields");
      return;
    }
    const encoded = `https://localhost:5006/api/auth/DoRegister?name=${encodeURIComponent(
      name
    )}&email=${encodeURIComponent(email)}&plainUsername=${encodeURIComponent(
      username
    )}&plainPassword=${encodeURIComponent(password)}`;
    const response = await fetch(`${encoded}`, {
      method: "POST",
    });
    const data = JSON.stringify(await response.text());
    if (data) {
      console.log(data);
      router.push("/");
    }
  }

  return (
    <React.Fragment>
      <>
        <div className={styles["register-container"]}>
          <h2 className={styles["h2"]}>Register</h2>
          <form className={styles["register-form"]} onSubmit={onSubmit}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              autoComplete="on"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              autoComplete="on"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="username">Username:</label>
            <input
              type="text"
              name="username"
              autoComplete="on"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              autoComplete="on"
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
      </>
    </React.Fragment>
  );
};

export default Register;
