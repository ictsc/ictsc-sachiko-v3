import Error from "next/error";

import LoadingPage from "@/components/LoadingPage";
import useUserGroups from "@/hooks/userGroups";
import CommonLayout from "@/layouts/CommonLayout";

function GithubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height="20px"
      width="20px"
    >
      <g data-name="Layer 2">
        <rect width="24" height="24" opacity="0" />
        <path d="M16.24 22a1 1 0 0 1-1-1v-2.6a2.15 2.15 0 0 0-.54-1.66 1 1 0 0 1 .61-1.67C17.75 14.78 20 14 20 9.77a4 4 0 0 0-.67-2.22 2.75 2.75 0 0 1-.41-2.06 3.71 3.71 0 0 0 0-1.41 7.65 7.65 0 0 0-2.09 1.09 1 1 0 0 1-.84.15 10.15 10.15 0 0 0-5.52 0 1 1 0 0 1-.84-.15 7.4 7.4 0 0 0-2.11-1.09 3.52 3.52 0 0 0 0 1.41 2.84 2.84 0 0 1-.43 2.08 4.07 4.07 0 0 0-.67 2.23c0 3.89 1.88 4.93 4.7 5.29a1 1 0 0 1 .82.66 1 1 0 0 1-.21 1 2.06 2.06 0 0 0-.55 1.56V21a1 1 0 0 1-2 0v-.57a6 6 0 0 1-5.27-2.09 3.9 3.9 0 0 0-1.16-.88 1 1 0 1 1 .5-1.94 4.93 4.93 0 0 1 2 1.36c1 1 2 1.88 3.9 1.52a3.89 3.89 0 0 1 .23-1.58c-2.06-.52-5-2-5-7a6 6 0 0 1 1-3.33.85.85 0 0 0 .13-.62 5.69 5.69 0 0 1 .33-3.21 1 1 0 0 1 .63-.57c.34-.1 1.56-.3 3.87 1.2a12.16 12.16 0 0 1 5.69 0c2.31-1.5 3.53-1.31 3.86-1.2a1 1 0 0 1 .63.57 5.71 5.71 0 0 1 .33 3.22.75.75 0 0 0 .11.57 6 6 0 0 1 1 3.34c0 5.07-2.92 6.54-5 7a4.28 4.28 0 0 1 .22 1.67V21a1 1 0 0 1-.94 1z" />
      </g>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height="20px"
      width="20px"
    >
      <g data-name="Layer 2">
        <g data-name="twitter">
          <polyline points="0 0 24 0 24 24 0 24" opacity="0" />
          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
        </g>
      </g>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height="20px"
      width="20px"
    >
      <g data-name="Layer 2">
        <g data-name="facebook">
          <rect
            width="24"
            height="24"
            transform="rotate(180 12 12)"
            opacity="0"
          />
          <rect
            width="24"
            height="24"
            transform="rotate(180 12 12)"
            opacity="0"
          />
          <path d="M13 22H9a1 1 0 0 1-1-1v-6.2H6a1 1 0 0 1-1-1v-3.6a1 1 0 0 1 1-1h2V7.5A5.77 5.77 0 0 1 14 2h3a1 1 0 0 1 1 1v3.6a1 1 0 0 1-1 1h-3v1.6h3a1 1 0 0 1 .8.39 1 1 0 0 1 .16.88l-1 3.6a1 1 0 0 1-1 .73H14V21a1 1 0 0 1-1 1zm-3-2h2v-6.2a1 1 0 0 1 1-1h2.24l.44-1.6H13a1 1 0 0 1-1-1V7.5a2 2 0 0 1 2-1.9h2V4h-2a3.78 3.78 0 0 0-4 3.5v2.7a1 1 0 0 1-1 1H7v1.6h2a1 1 0 0 1 1 1z" />
        </g>
      </g>
    </svg>
  );
}

function Users() {
  const { userGroups, isLoading } = useUserGroups();

  if (isLoading) {
    return (
      <CommonLayout title="参加者一覧">
        <LoadingPage />
      </CommonLayout>
    );
  }

  if (userGroups === null) {
    return <Error statusCode={404} />;
  }

  return (
    <CommonLayout title="参加者一覧">
      <div className="container-ictsc">
        <table className="table border rounded-md w-full">
          <thead>
            <tr>
              <th>名前</th>
              <th>チーム名</th>
              <th>自己紹介</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {userGroups?.map((userGroup) =>
              userGroup.members?.map((member) => (
                <tr key={member.id}>
                  <td className="whitespace-normal max-w-[300px]">
                    {member.display_name}
                    <div className="flex flex-row">
                      {(member.profile?.github_id ?? "") !== "" && (
                        <a
                          href={`https://github.com/${member.profile?.github_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-ghost btn-xs"
                        >
                          <GithubIcon />
                        </a>
                      )}
                      {(member.profile?.twitter_id ?? "") !== "" && (
                        <a
                          href={`https://twitter.com/${member.profile?.twitter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-ghost btn-xs"
                        >
                          <TwitterIcon />
                        </a>
                      )}
                      {(member.profile?.facebook_id ?? "") !== "" && (
                        <a
                          href={`https://www.facebook.com/${member.profile?.facebook_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-ghost btn-xs"
                        >
                          <FacebookIcon />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-normal lg:min-w-[196px]">
                    {userGroup.name}
                  </td>
                  <td className="whitespace-normal">
                    {member.profile?.self_introduction}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CommonLayout>
  );
}

export default Users;
