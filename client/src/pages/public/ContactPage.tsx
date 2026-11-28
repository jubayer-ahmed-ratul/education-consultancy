import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
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

  if (isLoading) {
    return (
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-4 px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-44 animate-pulse rounded-xl bg-zinc-200/70" />
      </div>
    );
  }
  const contact = data?.data;

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>{contact?.seoTitle || 'Contact Us'} â€” StudySphere</title>
        {contact?.seoDescription && <meta name="description" content={contact.seoDescription} />}
      </Helmet>

      <div className="space-y-1 border-b border-zinc-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Admissions Desk
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
          {contact?.headerTitle || 'Contact StudySphere'}
        </h1>
        <p className="text-sm text-zinc-700">{contact?.headerSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-4 rounded-xl bg-white p-6 text-sm ring-1 ring-zinc-950/10">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
            <div>
              <div className="font-semibold text-zinc-950">Office Address</div>
              <div className="text-zinc-700">{contact?.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
            <div>
              <div className="font-semibold text-zinc-950">Office Hours</div>
              <div className="text-zinc-700">{contact?.officeHours}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
            <div>
              <div className="font-semibold text-zinc-950">Phone & WhatsApp</div>
              <div className="text-zinc-700">{contact?.phones.join(', ') || 'â€”'}</div>
              {contact?.whatsappNumber && (
                <div className="text-xs text-zinc-600">WhatsApp: {contact.whatsappNumber}</div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
            <div>
              <div className="font-semibold text-zinc-950">Email</div>
              <div className="text-zinc-700">{contact?.emails.join(', ') || 'â€”'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-4 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
          <div className="space-y-2">
            <div className="font-display text-base font-bold text-zinc-950">
              Visit or Apply Online
            </div>
            <p className="text-xs text-zinc-700">{contact?.mapAddress || contact?.address}</p>
            <div className="font-mono text-xs text-zinc-600">
              Coordinates: {contact?.mapLatitude}, {contact?.mapLongitude}
            </div>
          </div>
          <Link to="/apply">
            <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
              {contact?.ctaHeading || 'Book Free Consultation'} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
