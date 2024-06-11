import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useApi } from "../context/ApiContext";

const CategoryPage = () => {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const apiUrl = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/posts?cat=${category}`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [category, apiUrl]);

  return (
    <div className="category-page">
      <h1>Category: {category}</h1>
      <div className="posts">
        {posts.map((post) => (
          <div className="post" key={post._id}>
            <div className="img">
              <img src={post.img} alt="" />
            </div>
            <div className="content">
              <h2>{post.title}</h2>
              <p>{post.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
