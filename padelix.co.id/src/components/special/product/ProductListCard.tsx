import { Card, type CardProps } from "@/components/general/Card";

export const ProductListCard = (props: Readonly<CardProps>) => (
  <Card {...props} basePath="products" showSpecification />
);
