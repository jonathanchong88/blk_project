import Head from 'next/head';
import supabase from '../../../db';

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return { notFound: true };
    }

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/events/${id}`;

    return {
      props: {
        event,
        redirectUrl,
      },
    };
  } catch (err) {
    console.error('Error fetching event for share:', err);
    return { notFound: true };
  }
}

export default function ShareEvent({ event, redirectUrl }) {
  const imageUrl = event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  
  return (
    <>
      <Head>
        <title>{event.title}</title>
        <meta name="description" content={event.description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={redirectUrl} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={redirectUrl} />
        <meta property="twitter:title" content={event.title} />
        <meta property="twitter:description" content={event.description} />
        <meta property="twitter:image" content={imageUrl} />

        {/* Redirect for users */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace("${redirectUrl}");`,
          }}
        />
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Redirecting to event details...</p>
      </div>
    </>
  );
}
