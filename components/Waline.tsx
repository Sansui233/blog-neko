import React, { useEffect } from 'react'
import { init } from '@waline/client';
import '@waline/client/dist/waline.css';
import { SiteInfo } from "../site.config";
import styled from 'styled-components';

const Waline = () => {
  useEffect(() => {
    // 挂载 waline 评论系统
    init({
      el: '#waline',
      serverURL: SiteInfo.walineApi,
      path: window.location.pathname
    });
  }, [])

  return (
    <StyledWL id="waline">Waline</StyledWL>
  )
}

const StyledWL = styled.div`
  --waline-theme-color: ${p => p.theme.colors.bgInverse};
  --waline-bgcolor: ${p => p.theme.colors.bg};
  --waline-color: ${p => p.theme.colors.textGray};
  --waline-active-color: ${p => p.theme.colors.gold};
  --waline-bgcolor-light: #99999915;
  .wl-panel {
    margin: .5rem 0;
    border-radius: unset;
  }
  .wl-login-info{
    margin-right: .5rem;
  }
  .wl-avatar {
    margin: 0 .5rem
  }

  .wl-heaer {
    border-bottom: 1px solid ${p => p.theme.colors.gold};
  }

  .wl-header label {
    font-size: 0.875rem;
  }

  .wl-btn {
    font-size: 0.875rem;
    border-radius: unset;
  }

  .wl-btn.primary {
    background: ${p => p.theme.colors.bgInverse};
  }
`

export default Waline