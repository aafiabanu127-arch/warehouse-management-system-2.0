"""
Report Export Utilities
-------------------------
Generates downloadable CSV, Excel (.xlsx), and PDF versions
of report data already produced by ReportViewSet._generate_report.
"""

import csv
import io

from django.http import HttpResponse

from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


def _flatten_report_result(report):
    """
    Report.result is a JSONField shaped like {'inventory': [...]} or
    {'warehouses': [...]} etc. This pulls out the list of row-dicts
    regardless of which key it's stored under.
    """
    if not report.result:
        return []
    for value in report.result.values():
        if isinstance(value, list):
            return value
    return []


def export_report_csv(report):
    rows = _flatten_report_result(report)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{report.title}.csv"'

    if not rows:
        response.write('No data available for this report.\n')
        return response

    writer = csv.DictWriter(response, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

    return response


def export_report_excel(report):
    rows = _flatten_report_result(report)

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = report.report_type[:31] if report.report_type else "Report"

    if rows:
        headers = list(rows[0].keys())
        sheet.append(headers)
        for row in rows:
            sheet.append([row.get(h, '') for h in headers])
    else:
        sheet.append(['No data available for this report.'])

    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{report.title}.xlsx"'
    return response


def export_report_pdf(report):
    rows = _flatten_report_result(report)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(report.title, styles['Title']))
    elements.append(Paragraph(f"Report Type: {report.get_report_type_display()}", styles['Normal']))
    elements.append(Paragraph(f"Generated: {report.created_at.strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 16))

    if rows:
        headers = list(rows[0].keys())
        table_data = [headers] + [[str(row.get(h, '')) for h in headers] for row in rows]

        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f2f2f2')]),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("No data available for this report.", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)

    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{report.title}.pdf"'
    return response