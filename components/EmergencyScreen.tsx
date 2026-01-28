import React from 'react';

export const EmergencyScreen: React.FC<{ message: { urdu: string; english: string } }> = ({ message }) => {
    return (
        <div style={{
            padding: '40px',
            backgroundColor: '#DC3545',
            color: 'white',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            direction: 'rtl'
        }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '32px', marginBottom: '20px', fontWeight: 'bold' }}>
                {message.urdu}
            </h1>
            <p style={{ fontSize: '20px', marginBottom: '40px', direction: 'ltr' }}>
                {message.english}
            </p>

            <a href="tel:1122" style={{
                padding: '20px 40px',
                backgroundColor: 'white',
                color: '#DC3545',
                fontSize: '24px',
                fontWeight: 'bold',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
                📞 1122 کال کریں (Call Emergency)
            </a>

            <button
                onClick={() => window.open('https://www.google.com/maps/search/hospital+near+me', '_blank')}
                style={{
                    padding: '16px 32px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '2px solid white',
                    fontSize: '18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            >
                🏥 قریبی ہسپتال تلاش کریں (Find Nearest Hospital)
            </button>

            <div style={{ marginTop: '40px', opacity: 0.8, fontSize: '14px' }}>
                Alshifa Safety Protocol • Code Red
            </div>
        </div>
    );
};
