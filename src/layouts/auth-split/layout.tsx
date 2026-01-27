import type { Breakpoint } from '@mui/material/styles';
import type { AuthSplitSectionProps } from './section';
import type { AuthSplitContentProps } from './content';
import type { MainSectionProps, LayoutSectionProps, HeaderSectionProps } from '../core';

import { merge } from 'es-toolkit';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Logo } from 'src/components/logo';
import { LanguagePopover } from 'src/layouts/components/language-popover';
import { AuthLocaleProvider, useAuthI18n } from 'src/auth/i18n/auth-i18n';

import { AuthSplitSection } from './section';
import { AuthSplitContent } from './content';
import { MainSection, LayoutSection, HeaderSection } from '../core';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type AuthSplitLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    section?: AuthSplitSectionProps;
    content?: AuthSplitContentProps;
  };
};

function AuthSplitLayoutInner({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthSplitLayoutProps) {
  const { locale, setLocale, options } = useAuthI18n();

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: { maxWidth: false },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Logo */}
          <Logo />
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/** @slot Help link */}

          {/** @slot Settings button */}
          <LanguagePopover data={options} value={locale} onChange={(next) => setLocale(next as any)} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={[
          { position: { [layoutQuery]: 'fixed' } },
          ...(Array.isArray(slotProps?.header?.sx) ? slotProps.header.sx : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        (theme) => ({ [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row' } }),
        ...(Array.isArray(slotProps?.main?.sx) ? slotProps.main.sx : [slotProps?.main?.sx]),
      ]}
    >
      <AuthSplitSection
        layoutQuery={layoutQuery}
        method={CONFIG.auth.method}
        {...slotProps?.section}
        methods={[
          {
            label: 'Jwt',
            path: paths.auth.jwt.signIn,
            icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-jwt.svg`,
          },
          {
            label: 'Firebase',
            path: paths.auth.firebase.signIn,
            icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-firebase.svg`,
          },
          {
            label: 'Amplify',
            path: paths.auth.amplify.signIn,
            icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-amplify.svg`,
          },
          {
            label: 'Auth0',
            path: paths.auth.auth0.signIn,
            icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-auth0.svg`,
          },
          {
            label: 'Supabase',
            path: paths.auth.supabase.signIn,
            icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-supabase.svg`,
          },
        ]}
      />
      <AuthSplitContent layoutQuery={layoutQuery} {...slotProps?.content}>
        {children}
      </AuthSplitContent>
    </MainSection>
  );

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ '--layout-auth-content-width': '420px', ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}

export function AuthSplitLayout(props: AuthSplitLayoutProps) {
  return (
    <AuthLocaleProvider>
      <AuthSplitLayoutInner {...props} />
    </AuthLocaleProvider>
  );
}
