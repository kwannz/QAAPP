import { Card as AntdCard } from 'antd';
import type { CardProps as AntdCardProps } from 'antd';
import { forwardRef } from 'react';

export interface CardProps extends AntdCardProps {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    return (
      <AntdCard
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const { Meta: CardMeta } = AntdCard;