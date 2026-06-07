// import apiClient from "./apiClient";

// export const runCode = async (code: string, language: string) => {
//   try {
//     const { data } = await apiClient.post("/execute/run");
//     return {
//       output: data.data.stdout || "",
//       error: data.data.stderr || ""
//     };
//   } catch (error: any) {
//     return {
//       output: "",
//       error: `Failed to execute: ${error?.response?.data?.message}`
//     };
//   }
// };

import Cookies from "js-cookie";

export const runCode = async (code: string, language: string) => {
  try {
    const token = Cookies.get("accessToken");
    console.log("TOKEN BEING SENT:", token);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/execute/run`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, language })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        output: "",
        error: data.message || "Execution failed"
      };
    }

    return {
      output: data.data.stdout || "",
      error: data.data.stderr || ""
    };
  } catch (error: any) {
    return {
      output: "",
      error: "Failed to connect to execution server"
    };
  }
};
