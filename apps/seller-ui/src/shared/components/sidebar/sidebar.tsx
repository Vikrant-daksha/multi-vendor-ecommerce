'use client';

import useSeller from '@/hooks/useSeller';
import useSidebar from '@/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import React, { useDebugValue, useEffect } from 'react';
import Box from '../box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import Logo from '@/assets/svgs/logo';
import SidebarItems from './sidebar.item';
import {
  BellRing,
  CalendarPlus,
  CalendarSearch,
  CreditCard,
  Home,
  ListOrdered,
  LogOut,
  Mail,
  PackagePlus,
  PackageSearch,
  Settings,
  TicketPercent,
  UsersRound,
} from 'lucide-react';
import SidebarMenu from './sidebar.menu';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  useEffect(() => {
    console.log(seller);
  }, [seller]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <Box
      css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: 0,
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={'/'} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shops[0]?.name}
              </h3>
              <h5 className="pl-2 font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shops[0]?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItems
            title="Dashboard"
            icon={<Home fill={getIconColor('/dashboard')} />}
            isActive={activeSidebar === '/dashboard'}
            href="/dashboard"
          />
          <div className="mt-2 block"></div>
          <SidebarMenu title="Main Menu">
            <SidebarItems
              isActive={activeSidebar === '/dashboard/orders'}
              title="Orders"
              href="/dashboard/orders"
              icon={
                <ListOrdered
                  size={26}
                  color={getIconColor('/dashboard/orders')}
                />
              }
            ></SidebarItems>
            <SidebarItems
              title="Payments"
              icon={
                <CreditCard
                  size={26}
                  color={getIconColor('/dashboard/payment')}
                />
              }
              isActive={activeSidebar === '/dashboard/payment'}
              href="/dashboard/payment"
            />
            <SidebarItems
              title="Accounts"
              icon={
                <UsersRound
                  size={26}
                  color={getIconColor('/dashboard/accounts')}
                />
              }
              isActive={activeSidebar === '/dashboard/accounts'}
              href="/dashboard/accounts"
            />
          </SidebarMenu>
          <SidebarMenu title="Products">
            <SidebarItems
              title="Create Products"
              icon={
                <PackagePlus
                  size={26}
                  color={getIconColor('/dashboard/create-product')}
                />
              }
              isActive={activeSidebar === '/dashboard/create-product'}
              href="/dashboard/create-product"
            />
            <SidebarItems
              title="All Products"
              icon={
                <PackageSearch
                  size={26}
                  color={getIconColor('/dashboard/all-products')}
                />
              }
              isActive={activeSidebar === '/dashboard/all-products'}
              href="/dashboard/all-products"
            />
          </SidebarMenu>
          <SidebarMenu title="Events">
            <SidebarItems
              title="Create Event"
              isActive={activeSidebar === '/dashboard/create-event'}
              href="/dashboard/create-event"
              icon={
                <CalendarPlus
                  size={26}
                  color={getIconColor('/dashboard/create-event')}
                />
              }
            />
            <SidebarItems
              title="All Events"
              isActive={activeSidebar === '/dashboard/all-events'}
              href="/dashboard/all-events"
              icon={
                <CalendarSearch
                  size={26}
                  color={getIconColor('/dashboard/all-events')}
                />
              }
            />
          </SidebarMenu>
          <SidebarMenu title="Controllers">
            <SidebarItems
              isActive={activeSidebar === '/dashboard/inbox'}
              title="Inbox"
              href="/dashboard/inbox"
              icon={<Mail size={26} color={getIconColor('/dashboard/inbox')} />}
            />
            <SidebarItems
              isActive={activeSidebar === '/dashboard/notifications'}
              title="Notifications"
              href="/dashboard/notifications"
              icon={
                <BellRing
                  size={26}
                  color={getIconColor('/dashboard/notifications')}
                />
              }
            />
            <SidebarItems
              isActive={activeSidebar === '/dashboard/settings'}
              title="Settings"
              href="/dashboard/settings"
              icon={
                <Settings
                  size={26}
                  color={getIconColor('/dashboard/settings')}
                />
              }
            />
          </SidebarMenu>
          <SidebarMenu title="Extras">
            <SidebarItems
              title="Discount-Codes"
              href="/dashboard/discount-codes"
              isActive={activeSidebar === '/dashboard/discount-codes'}
              icon={
                <TicketPercent
                  size={26}
                  color={getIconColor('/dashboard/discount-codes')}
                />
              }
            />
            <SidebarItems
              isActive={activeSidebar === '/logout'}
              title="Logout"
              href="/"
              icon={<LogOut size={20} color={getIconColor('/logout')} />}
            />
          </SidebarMenu>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
