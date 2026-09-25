import { Card, CardActionArea, CardHeader } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router";

export interface WidgetCardProps {
  title: string;
  link: string;
  image?: string;
  avatar?: ReactNode;
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
