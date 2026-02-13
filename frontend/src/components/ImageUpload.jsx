import React, { useState, useEffect } from 'react';

function ImageUpload({ token, BASE_URL }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageList, setImageList] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (token) {
      fetchImages();
    }
  }, [token]);

  const fetchImages = async () => {
    setLoadingImages(true);
    try {
      const response = await fetch(`${BASE_URL}/api/upload`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setImageList(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: reader.result,
            filename: file.name
          }),
        });
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid response');
        }

        if (response.ok) {
          setUploadedImageUrl(data.url);
          fetchImages();
        } else {
          alert(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error(error);
        alert('Upload error: ' + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div className="upload-section">
      <h2>Upload Image</h2>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {uploadedImageUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>Upload Successful!</p>
          <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '300px' }} />
        </div>
      )}

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Your Gallery</h3>
        {loadingImages ? (
          <p>Loading gallery...</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {imageList.map((img) => (
              <img key={img.name} src={img.url} alt={img.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;