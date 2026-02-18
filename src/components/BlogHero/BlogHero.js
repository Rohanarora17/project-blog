import React from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

import styles from './BlogHero.module.css';
function BlogHero({
  title,
  publishedOn,
  readingTime,
  className,
  ...delegated
}) {
  const humanizedDate = format(
    new Date(publishedOn),
    'MMMM do, yyyy'
  );

  return (
    <header
      className={clsx(styles.wrapper, className)}
      {...delegated}
    >
      <div className={styles.content}>
        <h1>{title}</h1>
        <p>
          Published on{' '}
          <time dateTime={publishedOn}>
            {humanizedDate}
          </time>
          {readingTime && (
            <span className={styles.readingTime}>
              {' '}· {readingTime}
            </span>
          )}
        </p>
      </div>
    </header>
  );
}

export default BlogHero;
