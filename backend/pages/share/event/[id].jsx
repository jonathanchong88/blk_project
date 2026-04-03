import Head from 'next/head';
import supabase from '../../../db';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const protocol = context.req.headers['x-forwarded-proto'] || 'http';
  const host = context.req.headers.host;
  const shareUrl = `${protocol}://${host}/share/event/${id}`;

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return { notFound: true };
    }

    const frontendUrl = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/events/${id}`;

    return {
      props: {
        event,
        redirectUrl,
        shareUrl,
      },
    };
  } catch (err) {
    console.error('Error fetching event for share:', err);
    return { notFound: true };
  }
}

// Helper to apply cropping parameters for optimal 1.91:1 social previews (1200x630)
function getOptimizedImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=630&q=80';

  // 1. Handle Unsplash URLs
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=630&q=80`;
  }

  // 2. Handle Supabase Storage URLs
  // NOTE: Providing the original public URL as Image Transformation (/render/image/) 
  // is a paid feature that might return 404/error on Free projects.
  return url;
}

export default function ShareEvent({ event, redirectUrl, shareUrl }) {
  const imageUrl = getOptimizedImageUrl(event.image_url);
  const siteTitle = 'BLK Project - Community & Events';
  
  return (
    <>
      <Head>
        <title>{`${event.title} | ${siteTitle}`}</title>
        <meta name="description" content={event.description || 'Join us for this community event!'} />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="BLK Project" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description || 'Join us for this community event!'} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@blk_project" />
        <meta name="twitter:url" content={shareUrl} />
        <meta name="twitter:title" content={event.title} />
        <meta name="twitter:description" content={event.description || 'Join us for this community event!'} />
        <meta name="twitter:image" content={imageUrl} />

        {/* Redirect for users (JS + Meta fallback) */}
        <meta httpEquiv="refresh" content={`0;url=${redirectUrl}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace("${redirectUrl}");`,
          }}
        />
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#333' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{event.title}</h1>
        <p>Redirecting to our community app...</p>
      </div>
    </>
  );
}
