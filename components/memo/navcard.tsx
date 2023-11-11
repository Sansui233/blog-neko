import styled from "styled-components";
import { MemoInfo } from "../../lib/data/memos.common";

type Props = {
  info: MemoInfo
}

export default function NavCard({ info }: Props) {
  return (
    <Layout>
      <div className="item active">
        <span className="title">Memos</span>
        <span className="count">{info.memos}</span>
      </div>
      <div className="item">
        <span className="title">Photos</span>
        <span className="count">{info.imgs}</span>
      </div>
    </Layout>
  )
}

const Layout = styled.section`
  margin-top: 1.5rem;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  color:${p => p.theme.colors.textPrimary};

  .item {
    padding: 0.25rem 0;
    margin-right: 0.75rem;
    border-right: 2px solid ${p => p.theme.colors.uiLineGray};
  }

  .item.active {
    border-right: 2px solid ${p => p.theme.colors.gold};
  }

  .title {
    font-weight: bold;
    margin-right: 0.25rem;
  }

  .count {
    font-size: 0.875rem;
    color: ${p => p.theme.colors.textGray};
  }
`
