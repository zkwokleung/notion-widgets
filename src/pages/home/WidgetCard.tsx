import { Card, CardActionArea, CardHeader } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export interface WidgetCardProps {
  title: string;
  link: string;
  image?: string;
  avatar?: React.ReactNode;
}

function WidgetCard(props: WidgetCardProps) {
  return (
    <>
      <Card sx={{ width: 275 }}>
        <Link to={props.link} style={{ color: "#FFF" }}>
          <CardActionArea>
            <CardHeader avatar={props.avatar} title={props.title} />
          </CardActionArea>
        </Link>
      </Card>
    </>
  );
}

export default WidgetCard;
