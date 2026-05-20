import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/profile', label: 'Личные данные' },
  { href: '/profile/favorites', label: 'Избранное' },
  { href: '/profile/history', label: 'История просмотров' },
  { href: '/profile/properties', label: 'Мои объявления' },
];

interface ProfileLayoutProps {
  /** Заголовок страницы (для <h1> и <title>). */
  title: string;
  /** Опциональный <title> для head; по умолчанию подставляется `${title} | Property Market`. */
  documentTitle?: string;
  description?: string;
  /** Контент правой колонки. */
  children: ReactNode;
  /** Дополнительные элементы справа от заголовка (например, кнопка «Создать»). */
  headerAction?: ReactNode;
}

/**
 * Каркас страниц личного кабинета: общий header/footer, левая навигация,
 * правая карточка с контентом. Раньше эта разметка дублировалась в каждом
 * файле pages/profile/*.tsx (порядка 60+ строк на странице).
 */
export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  title,
  documentTitle,
  description,
  children,
  headerAction,
}) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{documentTitle ?? `${title} | Property Market`}</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <Header />

      <main className="container mt-5 mb-5 profile-page">
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h1 className="mb-4 p-3 bg-light rounded shadow-sm mt-5">{title}</h1>
            {headerAction}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-4 border-bottom pb-2">Навигация</h5>
                <div className="list-group flex-grow-1 nav-pills">
                  {NAV_ITEMS.map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`list-group-item list-group-item-action py-3 mb-2 ${
                          isActive ? 'active' : ''
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="flex-grow-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="card h-100 shadow-sm">
              <div className="card-body">{children}</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
