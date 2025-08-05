import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateGroupPost() {
  const router = useRouter();
  const { groupId } = router.query;

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const titleRef = useRef();
  const contentRef = useRef();
  const formRef = useRef();

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = titleRef.current.value.trim();
    const content = contentRef.current.value.trim();

    if (!title || !content) {
      showMessage('Title and content are required', 'error');
      return;
    }

    const postData = {
      group_id: parseInt(groupId),
      title,
      content,
    };

    try {
      const res = await fetch('http://localhost:8080/create-group-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      const data = await res.json();

      if (data.success) {
        showMessage('Group post created successfully!', 'success');
        formRef.current.reset();

        setTimeout(() => {
          router.push(`/groupDetails?id=${groupId}`);
        }, 1500);
      } else {
        showMessage(data.message || 'Failed to create post', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error creating post. Please try again.', 'error');
    }
  };

  return (
    <>
      <Head>
        <title>Create Group Post - Social Network</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/style.css" />
      </Head>

      <section id="createGroupPostSection">
        <button className="return-button" onClick={() => window.history.back()}>
          Return
        </button>

        <div className="container-create">
          <h1>Create a New Group Post</h1>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="form-section">
              <label htmlFor="title">Title:</label>
              <input type="text" id="title" name="title" ref={titleRef} required />
            </div>

            <div className="form-section">
              <label htmlFor="content">Content:</label>
              <textarea id="content" name="content" rows="6" ref={contentRef} required />
            </div>

            <input type="submit" value="Post it" className="button-create" />
          </form>
        </div>
      </section>
    </>
  );
}
