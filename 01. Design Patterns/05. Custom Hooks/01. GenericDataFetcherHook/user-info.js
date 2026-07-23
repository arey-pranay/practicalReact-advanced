import { useCallback } from "react";
import { useDataSource } from "./data-source.hook";
import axios from "axios";

const fetchFromServer = (url) => async () => {
  const response = await axios.get(url);
  return response.data;
};

const getFromLocalStorage = (key) => () => {
  return localStorage.getItem(key);
};

export const UserInfo = ({ userId }) => {
  const fetchUser = useCallback(fetchFromServer(`/users/${userId}`), [userId]);
  const user = useDataSource(fetchUser);
  const message = useDataSource(getFromLocalStorage("msg"));
  const { name, age, country, books } = user || {};
  console.log("Am I rendering?");
  return user ? (
    <>
      <h2>{name}</h2>
      <p>Age: {age} years</p>
      <p>Country: {country}</p>
      <h2>Books</h2>
      <ul>
        {books.map((book) => (
          <li key={book}> {book} </li>
        ))}
      </ul>
    </>
  ) : (
    <h1>Loading...</h1>
  );
};
