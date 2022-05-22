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
  position: relative;
  --waline-theme-color: ${p => p.theme.colors.bgInverse};
  --waline-bgcolor: ${p => p.theme.colors.bg};
  --waline-color: ${p => p.theme.colors.textGray};
  --waline-active-color: ${p => p.theme.colors.gold};
  --waline-bgcolor-light: #99999915;
  --waline-border: 1px solid #99999966;
  --waline-border-color: #99999966;
  --waline-info-bgcolor: #99999915;
  .wl-avatar {
    margin: 0 .5rem;
  }
  .wl-card .wl-meta {
    display: none;
  }

  .wl-btn.primary {
    background: ${p => p.theme.colors.bgInverse};
    color:${p => p.theme.colors.bg};
  }
  .wl-gif-popup {
    .wl-gallery-column {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
      max-height: 200px;
    }
    img {
      width: unset !important;
      height: unset !important;
      border-color: ${p => p.theme.colors.bg};
    }
    input {
      background: ${p => p.theme.colors.bg};
      color: ${p => p.theme.colors.textPrimary};
    }
  }


  // @media screen and (max-width:580px) {
  //   .wl-footer {
  //     margin: unset;
  //     padding: 0.5rem 0.75rem;
  //   }
  
  //   .wl-gif-popup {
  //     width: 100%;
  //     left: 0;
  //     padding: 0;
  //   }
  // }

`

export default Waline