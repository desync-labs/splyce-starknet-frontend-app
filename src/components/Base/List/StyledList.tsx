import { List, ListItem, styled } from "@mui/material";

export const BaseListPreviewModal = styled(List)`
  padding: 0;
  & li {
    border-bottom: 1px solid #3d5580;
    padding: 16px;

    &.MuiListItemText-root {
      margin-top: 2px;
      margin-bottom: 2px;
    }
    span {
      color: #8ea4cc;
      font-size: 12px;
      font-weight: 700;
    }
    & div:last-of-type {
      color: #fff;
      font-size: 12px;
      font-weight: 500;
    }

    &:last-of-type {
      border: none;
    }
  }
`;

export const BaseList = styled(List)`
  width: 100%;
  & li {
    font-size: 14px;
    padding: 3px 0 3px 8px;
    span {
      font-size: 14px;
    }
    & div:last-child {
      padding-right: 8px;
    }
  }
  ${({ theme }) => theme.breakpoints.down("sm")} {
    > .MuiListItem-root {
      padding-left: 0;
      > .MuiListItemText-root {
        max-width: 75%;
      }
      .MuiListItemSecondaryAction-root {
        right: 0;
      }
    }
  }
`;

export const BaseListItem = styled(ListItem)`
  &.MuiListItem-root {
    align-items: center;
  }
  .MuiListItemSecondaryAction-root {
    max-width: 250px;
    word-break: break-all;
    text-align: right;
    position: static;
    transform: none;
  }
  &.short {
    .MuiListItemSecondaryAction-root {
      max-width: 120px;
    }
  }
  ${({ theme }) => theme.breakpoints.down("sm")} {
    justify-content: space-between;
  }
`;
