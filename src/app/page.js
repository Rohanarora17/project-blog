import React from 'react';

import BlogSummaryCard from '@/components/BlogSummaryCard';

import styles from './homepage.module.css';
import { getBlogPostList } from '@/helpers/file-helpers';
import Spinner from '@/components/Spinner';
import { BLOG_DESCRIPTION, BLOG_TITLE } from '@/constants';

 
export const metadata = {
  title: `${BLOG_TITLE}`,
  description :  BLOG_DESCRIPTION,
};

async function LoadFiles(){
  const files = await getBlogPostList();


  return files.map((blog, index) => (
    <BlogSummaryCard
      key={index}
      slug={blog.slug}
      title={blog.title}
      abstract={blog.abstract}
      publishedOn={blog.publishedOn}
    />
  ));
    


  

}




function Home() {

  

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.mainHeading}>
        Latest Content:
      </h1>

      <React.Suspense fallback ={<Spinner />}>
        <LoadFiles></LoadFiles>
      </React.Suspense>

      
      
    </div>
  );
}

export default Home;
