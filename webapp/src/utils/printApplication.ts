import type { Application } from "../modules/application/types";

export const printApplication = (app: Application) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Application Print - ${app.fileNumber}</title>
            <style>
                @page { size: A4; margin: 20mm; }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #000;
                    line-height: 1.5;
                }
                .container {
                    max-width: 210mm;
                    margin: 0 auto;
                }
                .header-top {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    margin-bottom: 20px;
                }
                .logo-section {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo-text {
                    font-family: 'Times New Roman', serif;
                    font-size: 32px;
                    font-weight: bold;
                    color: #d4af37; /* Gold-ish color */
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .logo-icon {
                    height: 40px;
                    width: auto;
                }
                .meta-bar {
                    display: flex;
                    justify-content: space-between;
                    border-top: 2px solid #000;
                    border-bottom: 2px solid #000;
                    padding: 5px 0;
                    font-weight: bold;
                    margin-bottom: 20px;
                    font-size: 14px;
                }
                .file-no { color: #000; }
                .file-no span { color: red; }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 10px;
                    text-align: left;
                    vertical-align: top;
                    font-size: 14px;
                }
                th {
                    font-weight: bold;
                    width: 30%;
                }
                .footer-address {
                    text-align: center;
                    font-weight: bold;
                    margin-top: 40px;
                    margin-bottom: 80px;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                }
                .sig-line {
                    border-top: 1px solid #000;
                    width: 25%;
                    padding-top: 5px;
                    font-size: 12px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header-top">
                    <span>${new Date().toLocaleString()}</span>
                    <span>Application Print</span>
                </div>

                <div class="logo-section">
                    <div class="logo-text">
                        <!-- SVG Icon for Scales of Justice -->
                        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 16h6l-3-7-3 7zM2 16h6l-3-7-3 7zM12 3v18M8 6h8M12 3L2 3l3 7M12 3l10 0-3 7" stroke="#333" fill="none"></path>
                        </svg>
                        UNIQUE LEGAL FIRM
                    </div>
                </div>

                <div class="meta-bar">
                    <div class="file-no">File No. <span>${app.fileNumber}</span></div>
                    <div class="date">Dt : ${app.date}</div>
                </div>

                <table>
                    <tr>
                        <th>COMPANY</th>
                        <td>${app.company}</td>
                    </tr>
                    <tr>
                        <th>APPLICATION NO.</th>
                        <td>${app.companyReference}</td>
                    </tr>
                    <tr>
                        <th>APPLICANT NAME</th>
                        <td>${app.applicantName}</td>
                    </tr>
                    <tr>
                        <th>BUYER NAME</th>
                        <td>${app.proposedOwner || '-'}</td>
                    </tr>
                    <tr>
                        <th>SELLER NAME</th>
                        <td>${app.currentOwner || '-'}</td>
                    </tr>
                    <tr>
                        <th>PROPERTY</th>
                        <td>${app.propertyDescription}</td>
                    </tr>
                </table>

                <div class="footer-address">
                    -: ADDRESS :-<br>
                    Office No 333, 3rd Floor, RK World<br>
                    Tower, Shital Park, 150 Feet Ring<br>
                    Road, Rajkot - 360001
                </div>

                <div class="signatures">
                    <div class="sig-line">Prepared By</div>
                    <div class="sig-line">Checked By</div>
                    <div class="sig-line">Done By</div>
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
