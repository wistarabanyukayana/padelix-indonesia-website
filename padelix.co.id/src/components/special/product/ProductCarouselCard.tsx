import { Card, type CardProps } from "@/components/general/Card";

export const ProductCarouselCard = (props: Readonly<CardProps>) => (
  <Card {...props} basePath="product" />
);
