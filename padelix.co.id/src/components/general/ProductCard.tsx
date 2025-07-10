import { Card, type CardProps } from "@/components/general/Card";

export const ProductCard = (props: Readonly<CardProps>) => (
  <Card {...props} basePath="product" />
);
