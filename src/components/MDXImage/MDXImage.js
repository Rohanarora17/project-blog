import React from 'react';
import Image from 'next/image';

import styles from './MDXImage.module.css';

function MDXImage({ src, alt, ...props }) {
    // If it's an external URL (http), fallback to standard img or configure remotePatterns
    // If it's a local path (starts with /), use next/image

    if (src.startsWith('/')) {
        return (
            <span className={styles.wrapper}>
                <Image
                    src={src}
                    alt={alt || ''}
                    width={800}
                    height={450} // Aspect ratio placeholder, CSS handles actual size
                    className={styles.image}
                    {...props}
                />
                {alt && <span className={styles.caption}>{alt}</span>}
            </span>
        );
    }

    // Fallback for external images without known dimensions
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={styles.image} {...props} />;
}

export default MDXImage;
