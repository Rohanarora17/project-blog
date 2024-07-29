import React from "react";
import Link from "next/link";

import Logo from "@/components/Logo";

import DecorativeSwoops from "./DecorativeSwoops";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <div className={styles.wrapper}>
      <DecorativeSwoops />
      <div className={styles.content}>
        <div>
          <Logo mobileAlignment="center" />

          <p className={styles.attribution}>Made with love ♥</p>
        </div>
        <nav>
          <h2 className={styles.linkHeading}>Links</h2>
          <ul className={styles.linkList}>
            <li>
              <Link href="/rss.xml">RSS feed</Link>
            </li>
            <li>
              <Link href="/todo">Terms of Use</Link>
            </li>
            <li>
              <Link href="/todo">Privacy Policy</Link>
            </li>
            <li>
              <a href="https://github.com/Rohanarora17">Github</a>
            </li>
            <li>
              <a href="https://x.com/Okayrohannn">Twitter(X)</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Footer;
