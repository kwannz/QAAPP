import { Card as AntdCard, type CardProps as AntdCardProperties } from 'antd';
import { forwardRef, type ElementRef } from 'react';

export interface CardProperties extends AntdCardProperties {}

export const Card = forwardRef<ElementRef<typeof AntdCard>, CardProperties>(
  (properties, reference) => {
    return (
      <AntdCard
        ref={reference}
        {...properties}
      />
    );
  },
);

Card.displayName = 'Card';

export const { Meta: CardMeta } = AntdCard;
