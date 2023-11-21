import { createContext, useReducer } from "react";
import "axios";
import githubReducer from "./GithubReducer";
import axios from "axios";
const GithubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

//call github api by axios
const github = axios.create({
  baseURL: GITHUB_URL,
  Authorization: `token ${GITHUB_TOKEN}`,
});
export const GithubProvider = ({ children }) => {
  const initialState = {
    users: [],
    user: {},
    repos: [],
    loading: false,
  };
  const [state, dispatch] = useReducer(githubReducer, initialState);

  //Get initial users (testing purposes)
  const fetchUsers = async () => {
    SetLoading();
    const response = await fetch(`${GITHUB_URL}/users`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const data = await response.json();
    dispatch({
      type: "GET_USERS",
      payload: data,
    });
  };
  //call api github by axios
  const searchUsers = async (text) => {
    SetLoading();

    const params = new URLSearchParams({
      q: text,
    });
    const response = await github.get(`/search/users?${params}`);

    dispatch({
      type: "GET_USERS",
      payload: response.data.items,
    });
  };

  //call api github by fetch!
  //   const searchUsers = async (text) => {
  //     SetLoading();

  //     const params = new URLSearchParams({
  //       q: text,
  //     });
  //     const response = await fetch(`${GITHUB_URL}/search/users?${params}`, {
  //       headers: {
  //      //   Authorization: `token ${GITHUB_TOKEN}`,
  //       },
  //     });

  //     const { items } = await response.json();
  //     dispatch({
  //       type: "GET_USERS",
  //       payload: items,
  //     });
  //   };

  //get user
  const getUser = async (login) => {
    SetLoading();

    const response = await fetch(`${GITHUB_URL}/users/${login}`, {
      headers: {
        //   Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    if (response.status === 404) {
      //redircte to not found page
      window.location = "/notfound";
    } else {
      const data = await response.json();
      dispatch({
        type: "GET_USER",
        payload: data,
      });
    }
  };
  //get repos
  const getUserRepos = async (login) => {
    SetLoading();

    const params = new URLSearchParams({
      sort: "created",
      per_page: 10,
    });
    const response = await fetch(
      `${GITHUB_URL}/users/${login}/repos?${params}`,
      {
        headers: {
          //  Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    dispatch({
      type: "GET_REPOS",
      payload: data,
    });
  };

  //get user and repos in one call api
  //using promise.all that pass array of request
  const getUserAndRepos = async (login) => {
    const [user, repos] = await Promise.all([
      github.get(`/users/${login}`),
      github.get(`/users/${login}/repos`),
    ]);
    dispatch({
      type: "GET_USER_AND_REPOS",
      payload: { user: user.data, repos: repos.data },
    });
  };
  
  const clearUsers = () => {
    dispatch({
      type: "CLEAR_USERS",
    });
  };
  //Set loading
  const SetLoading = () => {
    dispatch({
      type: "SET_LOADING",
    });
  };
  return (
    <GithubContext.Provider
      value={{
        users: state.users,
        loading: state.loading,
        user: state.user,
        repos: state.repos,
        searchUsers,
        clearUsers,
        getUser,
        getUserRepos,
        getUserAndRepos
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};
export default GithubContext;
