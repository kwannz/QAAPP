import { Card as AntdCard } from 'antd';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';

export interface CardProperties
  extends ComponentPropsWithoutRef<typeof AntdCard> {}

type CardReference = ElementRef<typeof AntdCard>;

export const Card = forwardRef<CardReference, CardProperties>(
  (properties, reference) => <AntdCard ref={reference} {...properties} />,
);

Card.displayName = 'Card';

export const { Meta: CardMeta } = AntdCard;

