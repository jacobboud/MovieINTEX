// src/pages/Privacy.tsx
import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="container my-5">
      <div className="p-4 shadow rounded bg-white">
        <h1 className="mb-4 text-center">Privacy Policy for CineNiche</h1>
        <p>
          <strong>Effective Date:</strong> 04/07/2025
        </p>

        <section className="mt-5">
          <h4>1. Who We Are</h4>
          <p>
            CineNiche is a growing movie streaming platform that curates unique
            and niche films for users worldwide. We’re committed to protecting
            your data and ensuring a safe viewing experience.
          </p>
        </section>

        <section className="mt-5">
          <h4>2. What Data We Collect</h4>
          <p>We may collect the following types of personal information:</p>
          <ul className="list-unstyled ps-3">
            <li>• Full Name</li>
            <li>• Email Address</li>
            <li>• Phone Number</li>
            <li>• Age</li>
            <li>• Gender</li>
            <li>• City, State, and ZIP Code</li>
            <li>• Streaming Services You Use</li>
          </ul>
        </section>

        <section className="mt-5">
          <h4>3. Why We Collect Your Data</h4>
          <p>
            Your data helps us provide a personalized experience, improve the
            content we offer, and better understand who our audience is.
          </p>
        </section>

        <section className="mt-5">
          <h4>4. How We Use Your Data</h4>
          <p>
            <strong>Personalization:</strong> We use your preferences and
            demographics to tailor recommendations just for you.
          </p>
          <p>
            <strong>Communication:</strong> We may send you updates or special
            offers via email or SMS (only with your consent).
          </p>
          <p>
            <strong>Platform Improvement:</strong> Data helps us understand
            which features and content matter most to our users.
          </p>
        </section>

        <section className="mt-5">
          <h4>5. Legal Basis for Processing</h4>
          <p>
            We process your data under the lawful bases of consent, contract
            fulfillment, and legitimate interest, in accordance with the General
            Data Protection Regulation (GDPR).
          </p>
        </section>

        <section className="mt-5">
          <h4>6. How We Store and Protect Your Data</h4>
          <p>
            All user data is encrypted in transit and at rest. We regularly
            update our systems and use secure cloud infrastructure with strict
            access controls to protect your privacy.
          </p>
        </section>

        <section className="mt-5">
          <h4>7. Sharing Your Data</h4>
          <p>
            We do not sell your personal data. It may be shared with third-party
            service providers who assist us in delivering and improving
            CineNiche, under strict confidentiality agreements.
          </p>
        </section>

        <section className="mt-5">
          <h4>8. Your Rights Under GDPR</h4>
          <p>
            <strong>Access:</strong> You can request a copy of the personal data
            we hold about you.
          </p>
          <p>
            <strong>Correction:</strong> You have the right to request
            correction of inaccurate data.
          </p>
          <p>
            <strong>Deletion:</strong> You can ask us to delete your data at any
            time.
          </p>
          <p>
            <strong>Consent Withdrawal:</strong> You can withdraw consent for
            communications at any time.
          </p>
          <p>
            <strong>Portability:</strong> You may request that your data be
            transferred to another service provider.
          </p>
        </section>

        <section className="mt-5">
          <h4>9. Contact Information</h4>
          <p>
            For questions or concerns about your personal data, contact our
            team:
          </p>
          <p>
            Email:{' '}
            <a href="mailto:privacy@cineniche.com">privacy@cineniche.com</a>
            <br />
            Phone: (555) 555-5555
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
