import { Alert } from "@mui/material";
import { Link } from "react-router";

function NotFound({ message = "This page doesn't exist." }: { message?: string }) {
  return (
    <Alert severity="warning" sx={{ m: 2 }}>
      {message} <Link to="/">See all widgets</Link>
    </Alert>
  );
}

export default NotFound;
