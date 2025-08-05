import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function GroupDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;

    async function fetchGroupData() {
      try {
        const groupRes = await fetch(`http://localhost:8080/group-details/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const groupData = await groupRes.json();
        setGroup(groupData.group || null);

        const postsRes = await fetch(`http://localhost:8080/get-group-posts/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const postData = await postsRes.json();
        setPosts(postData.posts || []);
      } catch (error) {
        console.error("Failed to fetch group details or posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupData();
  }, [router.isReady, id]);

  return (
    <div className="container">
      {loading ? (
        <p>Loading group details...</p>
      ) : (
        <>
          <h1>Group: {group?.title || 'Untitled'}</h1>
          <p>{group?.description || 'No description available.'}</p>

          {/* ✅ Button to go to post creation page */}
          <Link href={`/createGroupPost?groupId=${id}`}>
            <button>Create a New Group Post</button>
          </Link>

          <hr />
          <h3>Group Posts</h3>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post">
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                <small>By user #{post.user_id}</small>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
