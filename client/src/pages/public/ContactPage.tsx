import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';

interface ContactPageData {
  headerTitle: string;
  headerSubtitle: string;
  address: string;
  phones: string[];
  whatsappNumber?: string | null;
  emails: string[];
  officeHours: string;
  mapLatitude: number;
  mapLongitude: number;
  mapAddress: string;
  ctaHeading: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default function ContactPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-contact-page'],
    queryFn: () => apiRequest<ContactPageData | null>('/content/contact-page'),
  });

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-[#6B7280]">Loading...</div>;
  const contact = data?.data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>{contact?.seoTitle || 'Contact Us'} — Zero Compile</title>
        {contact?.seoDescription && <meta name="description" content={contact.seoDescription} />}
      </Helmet>

      <div className="border-b border-[#E5E2DC] pb-6 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Admissions Desk</span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">{contact?.headerTitle || 'Contact Zero Compile'}</h1>
        <p className="text-sm text-[#4B5563]">{contact?.headerSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-[#0D3B2E] mt-1" />
            <div>
              <div className="font-semibold text-[#111827]">Office Address</div>
              <div className="text-[#4B5563]">{contact?.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 shrink-0 text-[#0D3B2E] mt-1" />
            <div>
              <div className="font-semibold text-[#111827]">Office Hours</div>
              <div className="text-[#4B5563]">{contact?.officeHours}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 shrink-0 text-[#0D3B2E] mt-1" />
            <div>
              <div className="font-semibold text-[#111827]">Phone & WhatsApp</div>
              <div className="text-[#4B5563]">{contact?.phones.join(', ') || '—'}</div>
              {contact?.whatsappNumber && <div className="text-xs text-[#6B7280]">WhatsApp: {contact.whatsappNumber}</div>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 shrink-0 text-[#0D3B2E] mt-1" />
            <div>
              <div className="font-semibold text-[#111827]">Email</div>
              <div className="text-[#4B5563]">{contact?.emails.join(', ') || '—'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-4">
          <div className="space-y-2">
            <div className="font-display text-base font-bold text-[#111827]">Visit or Apply Online</div>
            <p className="text-xs text-[#6B7280]">
              {contact?.mapAddress || contact?.address}
            </p>
            <div className="font-mono text-xs text-[#6B7280]">
              Coordinates: {contact?.mapLatitude}, {contact?.mapLongitude}
            </div>
          </div>
          <Link
            to="/apply"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092A20]"
          >
            {contact?.ctaHeading || 'Submit Online Inquiry'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
